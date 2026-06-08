export type ScenarioKey =
  | "chest_pain_high_risk"
  | "hypertension_followup"
  | "child_fever"
  | "high_glucose_exam"
  | "cough_fever"
  | "abdominal_pain_diarrhea"
  | "general_health_consult"

export function detectScenario(input: string): ScenarioKey {
  const text = input.toLowerCase()

  if (/(胸闷|胸痛|心前区|chest)/i.test(text)) {
    return "chest_pain_high_risk"
  }

  if (/(高血压).*(复诊|续方|随访)|复诊.*高血压/.test(text)) {
    return "hypertension_followup"
  }

  if (/(儿童|孩子|小孩|宝宝|5岁).*(发热|发烧)|发热.*(儿童|孩子|小孩|宝宝|5岁)/.test(text)) {
    return "child_fever"
  }

  if (/(血糖|糖化|体检).*(偏高|异常)|偏高.*血糖/.test(text)) {
    return "high_glucose_exam"
  }

  if (/(咳嗽).*(发热|发烧)|(发热|发烧).*咳嗽/.test(text)) {
    return "cough_fever"
  }

  if (/(腹痛|肚子痛).*(腹泻|拉肚子)|(腹泻|拉肚子).*(腹痛|肚子痛)/.test(text)) {
    return "abdominal_pain_diarrhea"
  }

  return "general_health_consult"
}

export function scenarioLabel(scenarioKey: ScenarioKey) {
  const labels: Record<ScenarioKey, string> = {
    chest_pain_high_risk: "胸闷胸痛高风险",
    hypertension_followup: "高血压稳定复诊",
    child_fever: "儿童发热",
    high_glucose_exam: "体检血糖偏高",
    cough_fever: "咳嗽发热",
    abdominal_pain_diarrhea: "腹痛腹泻",
    general_health_consult: "普通健康咨询",
  }

  return labels[scenarioKey]
}

export function scenarioQuestions(scenarioKey: ScenarioKey) {
  const questions: Record<ScenarioKey, string[]> = {
    chest_pain_high_risk: [
      "胸痛或胸闷从什么时候开始？是否持续超过15分钟？",
      "是否伴随出汗、气短、恶心、左肩或左臂放射痛？",
      "既往是否有高血压、冠心病、糖尿病或吸烟史？",
    ],
    hypertension_followup: [
      "最近一周家庭血压大概是多少？",
      "目前正在服用哪些降压药？是否规律服药？",
      "是否出现头晕、胸闷、下肢水肿等不适？",
    ],
    child_fever: [
      "孩子最高体温是多少？精神状态和进食饮水如何？",
      "是否伴随咳嗽、皮疹、呕吐、腹泻或抽搐？",
      "是否使用过退热药？用药后体温是否下降？",
    ],
    high_glucose_exam: [
      "体检空腹血糖和糖化血红蛋白分别是多少？",
      "是否有口渴、多尿、体重下降或家族糖尿病史？",
      "近期饮食、运动和体重是否有明显变化？",
    ],
    cough_fever: [
      "发热和咳嗽持续了几天？最高体温是多少？",
      "是否有咳痰、胸闷、气促或咽痛？",
      "近期是否接触过呼吸道感染患者？",
    ],
    abdominal_pain_diarrhea: [
      "腹痛位置在哪里？腹泻每天几次？",
      "是否有发热、呕吐、便血或明显脱水？",
      "近期是否进食不洁食物或多人同时不适？",
    ],
    general_health_consult: [
      "目前最主要的不适或健康问题是什么？",
      "症状持续多久？是否逐渐加重？",
      "既往是否有慢病、过敏史或长期用药？",
    ],
  }

  return questions[scenarioKey]
}
