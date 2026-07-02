import { MAX_QTY } from './pricing';

export function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return "Name cannot be blank or spaces only. Please enter your name.";
  }
  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (cleanName.length > 40) {
    return "Name must be 40 characters or fewer.";
  }
  if (!/^[A-Za-z ]+$/.test(cleanName)) {
    return "Name must contain letters and spaces only — no digits or symbols.";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) {
    return "Phone number is required.";
  }
  const cleanPhone = phone.trim();
  if (!/^\d+$/.test(cleanPhone)) {
    return "Phone number must contain digits only.";
  }
  if (cleanPhone.length !== 10) {
    return `Phone number must be exactly 10 digits (you entered ${cleanPhone.length}).`;
  }
  if (!/^[6789]/.test(cleanPhone)) {
    return "Invalid number. Indian mobile numbers must start with 6, 7, 8, or 9.";
  }
  return null;
}

export function validateQuantity(qtyVal: any): { qty: number | null; error: string | null } {
  if (qtyVal === undefined || qtyVal === null || String(qtyVal).trim() === "") {
    return { qty: null, error: "Quantity is required." };
  }
  const qtyStr = String(qtyVal).trim();
  if (qtyStr.includes(".")) {
    return { qty: null, error: "Please enter a whole number between 1 and 10 — decimals are not allowed." };
  }
  const qty = Number(qtyStr);
  if (isNaN(qty) || !Number.isInteger(qty)) {
    return { qty: null, error: `Please enter a whole number between 1 and ${MAX_QTY} — '${qtyStr}' is not valid.` };
  }
  if (qty <= 0) {
    return { qty: null, error: "Minimum order is 1 pizza." };
  }
  if (qty > MAX_QTY) {
    return { qty: null, error: `Maximum per combo is ${MAX_QTY} pizzas.` };
  }
  return { qty, error: null };
}
