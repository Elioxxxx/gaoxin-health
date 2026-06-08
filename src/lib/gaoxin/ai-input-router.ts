export function resolveGaoxinAiInputTarget(text: string) {
  const encoded = encodeURIComponent(text)

  if (/胸|胸闷|胸痛/.test(text)) {
    return `/gaoxin/pre-consult?demo=chest-pain&input=${encoded}`
  }

  if (/高血压|血压/.test(text)) {
    return `/gaoxin/pre-consult?demo=hypertension&input=${encoded}`
  }

  if (/发热|孩子|儿童/.test(text)) {
    return `/gaoxin/pre-consult?demo=child-fever&input=${encoded}`
  }

  if (/血糖|体检/.test(text)) {
    return `/gaoxin/pre-consult?demo=blood-sugar&input=${encoded}`
  }

  if (/报告/.test(text)) {
    return `/gaoxin/report-ai?input=${encoded}`
  }

  return `/gaoxin/pre-consult?input=${encoded}`
}
