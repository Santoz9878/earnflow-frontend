export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/\d/.test(password)) return 'Password must contain at least 1 number'
  return null
}
export const validateMpesaNumber = (number) => /^(?:\+254|0)[17]\d{8}$/.test(number.replace(/\s/g, ''))
export const validateAmount = (amount, balance, min = 550) => {
  const num = Number(amount)
  if (isNaN(num) || num <= 0) return 'Enter a valid amount'
  if (num < min) return 'Minimum is Ksh ' + min
  if (num > balance) return 'Insufficient balance'
  return null
}
