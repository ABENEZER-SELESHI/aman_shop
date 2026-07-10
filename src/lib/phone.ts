/** Accepts local 09… / 07… or +251… / 251… Ethiopian mobiles. */
export function isValidEthiopianPhone(value: string): boolean {
  const cleaned = value.replace(/[\s()-]/g, "");
  return /^(?:\+?251|0)?9\d{8}$/.test(cleaned) || /^(?:\+?251|0)?7\d{8}$/.test(cleaned);
}

export function normalizeEthiopianPhone(value: string): string {
  const cleaned = value.replace(/[\s()-]/g, "");
  if (cleaned.startsWith("+251")) return cleaned;
  if (cleaned.startsWith("251")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+251${cleaned.slice(1)}`;
  return `+251${cleaned}`;
}

export function whatsappUrl(phoneDigits: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits.replace(/\D/g, "")}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}
