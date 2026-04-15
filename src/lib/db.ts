import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set in the environment.");
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

/**
 * Connect to MongoDB using a singleton pattern so we don't create
 * multiple connections across hot reloads or lambda invocations.
 */
export async function dbConnect() {
  if (!global.mongooseConn) {
    global.mongooseConn = { conn: null, promise: null };
  }

  if (global.mongooseConn.conn) return global.mongooseConn.conn;

  if (!global.mongooseConn.promise) {
    global.mongooseConn.promise = mongoose.connect(uri, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || undefined,
    });
  }

  global.mongooseConn.conn = await global.mongooseConn.promise;
  return global.mongooseConn.conn;
}
