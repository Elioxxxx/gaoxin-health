export function addDays(days: number) {
  const value = new Date()
  value.setDate(value.getDate() + days)
  return value
}
