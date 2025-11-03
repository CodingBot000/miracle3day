export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const isValidEmail = (value?: string) =>
  !!value && emailRegex.test(value.trim())