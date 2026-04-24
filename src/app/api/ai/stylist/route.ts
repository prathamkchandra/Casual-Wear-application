import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/data";
import { getSafeProductImage } from "@/lib/image";
import { AiRecommendationDTO, AiStylistResponseDTO } from "@/types/shop";

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(180),
});

type CatalogItem = {
  slug: string;
  title: string;
  description: string;
  priceInINR: number;
  tags: string[];
  colors: string[];
  image: string;
};

function parseBudgetInINR(prompt: string): number | null {
  const match = prompt.match(/(?:under|below|less than)\s*(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return match[2] ? value * 1000 : value;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreProduct(product: CatalogItem, promptTokens: string[], budget: number | null) {
  let score = 0;
  const haystack = `${product.title} ${product.description} ${product.tags.join(" ")} ${product.colors.join(" ")}`.toLowerCase();

  for (const token of promptTokens) {
    if (token.length < 3) continue;
    if (product.title.toLowerCase().includes(token)) score += 8;
    else if (product.tags.join(" ").toLowerCase().includes(token)) score += 6;
    else if (product.colors.join(" ").toLowerCase().includes(token)) score += 5;
    else if (haystack.includes(token)) score += 3;
  }

  if (budget !== null) {
    score += product.priceInINR <= budget ? 6 : -3;
  }

  return score;
}

function buildReason(product: CatalogItem, promptTokens: string[], budget: number | null) {
  const matched = promptTokens.filter((token) => {
    const t = token.toLowerCase();
    return (
      product.title.toLowerCase().includes(t) ||
      product.tags.some((tag) => tag.toLowerCase().includes(t)) ||
      product.colors.some((color) => color.toLowerCase().includes(t))
    );
  });

  const reasonParts: string[] = [];
  if (matched.length) {
    reasonParts.push(`Matches your ${matched.slice(0, 2).join(" + ")} preference`);
  }
  if (budget !== null && product.priceInINR <= budget) {
    reasonParts.push("Fits your budget");
  }
  if (!reasonParts.length) {
    reasonParts.push("Balanced everyday pick for comfort and versatility");
  }

  return reasonParts.join(". ");
}

function buildFallback(prompt: string, catalog: CatalogItem[]): AiStylistResponseDTO {
  const tokens = tokenize(prompt);
  const budget = parseBudgetInINR(prompt);
  const ranked = catalog
    .map((product) => ({
      product,
      score: scoreProduct(product, tokens, budget),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const recommendations: AiRecommendationDTO[] = ranked.map(({ product }) => ({
    slug: product.slug,
    title: product.title,
    priceInINR: product.priceInINR,
    image: product.image,
    reason: buildReason(product, tokens, budget),
  }));

  return {
    message: `Here are curated picks for "${prompt}".`,
    source: "fallback",
    recommendations,
  };
}

async function tryOpenAI(prompt: string, catalog: CatalogItem[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const compactCatalog = catalog.slice(0, 25).map((item) => ({
    slug: item.slug,
    title: item.title,
    priceInINR: item.priceInINR,
    tags: item.tags.slice(0, 4),
    colors: item.colors.slice(0, 4),
  }));

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a fashion stylist for a casualwear store in India. Return JSON only with keys: message (string), recommendedSlugs (string array of up to 4 slugs). Recommend only from provided catalog.",
        },
        {
          role: "user",
          content: `User request: ${prompt}\nCatalog: ${JSON.stringify(compactCatalog)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as { message?: string; recommendedSlugs?: string[] };
  if (!Array.isArray(parsed.recommendedSlugs) || parsed.recommendedSlugs.length === 0) {
    return null;
  }

  const bySlug = new Map(catalog.map((item) => [item.slug, item]));
  const recommendations: AiRecommendationDTO[] = [];

  for (const slug of parsed.recommendedSlugs) {
    const product = bySlug.get(String(slug));
    if (!product) continue;
    recommendations.push({
      slug: product.slug,
      title: product.title,
      priceInINR: product.priceInINR,
      image: product.image,
      reason: "Recommended by AI stylist based on your prompt",
    });
    if (recommendations.length === 4) break;
  }

  if (!recommendations.length) return null;

  return {
    message: parsed.message || `Here are AI picks for "${prompt}".`,
    source: "openai" as const,
    recommendations,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Please enter a valid style request." }, { status: 400 });
    }

    const products = await getProducts(60);
    const catalog: CatalogItem[] = products.map((product) => ({
      slug: product.slug,
      title: product.title,
      description: product.description,
      priceInINR: product.priceInINR,
      tags: product.tags ?? [],
      colors: product.colors ?? [],
      image: getSafeProductImage(product.images?.[0]),
    }));

    if (!catalog.length) {
      return NextResponse.json(
        {
          message: "Catalog is empty. Add products to get AI suggestions.",
          source: "fallback",
          recommendations: [],
        } satisfies AiStylistResponseDTO
      );
    }

    const prompt = parsed.data.prompt;
    try {
      const aiResult = await tryOpenAI(prompt, catalog);
      if (aiResult) {
        return NextResponse.json(aiResult satisfies AiStylistResponseDTO);
      }
    } catch (error) {
      const fallback = buildFallback(prompt, catalog);
      return NextResponse.json({
        ...fallback,
        warning: error instanceof Error ? error.message : "AI service unavailable, fallback applied.",
      } satisfies AiStylistResponseDTO);
    }

    return NextResponse.json(buildFallback(prompt, catalog) satisfies AiStylistResponseDTO);
  } catch {
    return NextResponse.json({ message: "Unable to process request." }, { status: 500 });
  }
}
