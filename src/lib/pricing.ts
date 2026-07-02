import { CartItem, BillSummary } from './types';

export const DISCOUNT_THRESHOLD = 5;
export const DISCOUNT_RATE = 0.10;
export const GST_RATE = 0.18;
export const MAX_QTY = 10;
export const MAX_ORDER_QTY = 10;

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function computeBillForCart(cart: CartItem[]): BillSummary {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const lineSubtotals: number[] = [];
  let orderSubtotal = 0;

  for (const line of cart) {
    const toppingPrice = line.topping ? Number(line.topping.price) : 0;
    const unitPrice = Number(line.base.price) + Number(line.pizza.price) + toppingPrice;
    const sub = unitPrice * line.qty;
    lineSubtotals.push(roundToTwo(sub));
    orderSubtotal += sub;
  }

  orderSubtotal = roundToTwo(orderSubtotal);

  let discount = 0;
  if (totalQty >= DISCOUNT_THRESHOLD) {
    discount = roundToTwo(orderSubtotal * DISCOUNT_RATE);
  }

  const postDiscount = roundToTwo(orderSubtotal - discount);
  const gst = roundToTwo(postDiscount * GST_RATE);
  const finalTotal = roundToTwo(postDiscount + gst);

  return {
    lineSubtotals,
    totalQty,
    subtotal: orderSubtotal,
    discount,
    postDiscount,
    gst,
    finalTotal
  };
}
