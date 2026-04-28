export const SHIPPING_FEE_INR = 10;

export type CheckoutDeliveryAddress = {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
};

export type CheckoutItemInput = {
  productId: string;
  qty: number;
  size?: string;
  color?: string;
};

export const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export const normalizeDeliveryAddress = (deliveryAddress: CheckoutDeliveryAddress) => ({
  firstName: deliveryAddress.firstName.trim(),
  lastName: deliveryAddress.lastName.trim(),
  email: deliveryAddress.email.trim().toLowerCase(),
  addressLine1: deliveryAddress.addressLine1.trim(),
  city: deliveryAddress.city.trim(),
  state: deliveryAddress.state.trim(),
  zipCode: deliveryAddress.zipCode.trim(),
  country: deliveryAddress.country.trim(),
  phone: deliveryAddress.phone.trim(),
});

export const validateDeliveryAddress = (
  deliveryAddress?: Partial<CheckoutDeliveryAddress>
) => {
  if (
    !deliveryAddress?.firstName?.trim() ||
    !deliveryAddress?.lastName?.trim() ||
    !deliveryAddress?.email?.trim() ||
    !deliveryAddress?.addressLine1?.trim() ||
    !deliveryAddress?.city?.trim() ||
    !deliveryAddress?.state?.trim() ||
    !deliveryAddress?.zipCode?.trim() ||
    !deliveryAddress?.country?.trim() ||
    !deliveryAddress?.phone?.trim()
  ) {
    return "Delivery details are required";
  }

  if (!isValidEmail(deliveryAddress.email.trim())) {
    return "Please enter a valid email address";
  }

  return null;
};
