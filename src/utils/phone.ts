const ETHIOPIAN_MOBILE_PATTERN = /^(?:\+251|251|0)(?:9|7)\d{8}$/;

const compactPhone = (phone: string): string => phone.replace(/[\s-]/g, "").trim();

export const isValidEthiopianPhone = (phone: string): boolean => ETHIOPIAN_MOBILE_PATTERN.test(compactPhone(phone));

export const normalizeEthiopianPhone = (phone: string): string => {
  const compact = compactPhone(phone);

  if (!isValidEthiopianPhone(compact)) {
    throw new Error("Invalid Ethiopian phone number");
  }

  if (compact.startsWith("+251")) return compact;
  if (compact.startsWith("251")) return `+${compact}`;
  return `+251${compact.slice(1)}`;
};
