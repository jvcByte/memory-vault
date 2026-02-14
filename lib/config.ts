// Whitelist configuration
export const ALLOWED_EMAIL = 'jvcbyte@gmail.com'

export function isEmailAllowed(email: string): boolean {
  return email.toLowerCase() === ALLOWED_EMAIL.toLowerCase()
}
