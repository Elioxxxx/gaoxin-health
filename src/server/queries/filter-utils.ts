export function enumValue<T extends Record<string, string>>(
  values: T,
  value: string | null
) {
  return value && Object.values(values).includes(value)
    ? (value as T[keyof T])
    : undefined
}
