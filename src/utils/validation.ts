// src/utils/validation.ts

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}$/;
  return regex.test(phone);
}

export function validateEquipmentCode(code: string): boolean {
  return code.length > 0 && code.length <= 50;
}

export function validateNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
