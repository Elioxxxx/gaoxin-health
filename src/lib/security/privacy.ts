export function redactSensitiveText(text: string) {
  return text
    .replace(/\b1[3-9]\d{9}\b/g, "[手机号已脱敏]")
    .replace(/\b\d{6}(18|19|20)\d{2}\d{7}[\dXx]\b/g, "[身份证号已脱敏]")
}

export function redactSensitiveObject<T>(value: T): T {
  const serialized = JSON.stringify(value)

  if (!serialized) {
    return value
  }

  return JSON.parse(redactSensitiveText(serialized)) as T
}
