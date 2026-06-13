import { getRuntimeConfig } from "@/lib/config/runtime"

import { MockMedicalDataConnector } from "./connectors/mock-medical-data-connector"
import type { CanonicalHealthSnapshot, MedicalDataConnector } from "./types"

export class MedicalDataGateway {
  constructor(private readonly connector: MedicalDataConnector) {}

  async fetchHealthSnapshot(input: {
    externalResidentId: string
    since?: Date
  }): Promise<CanonicalHealthSnapshot> {
    return this.connector.fetchHealthSnapshot(input)
  }
}

export function getMedicalDataGateway() {
  const config = getRuntimeConfig()

  if (config.medicalDataSource !== "mock") {
    // 生产真实连接器会在这里按 HIS/EMR/LIS/PACS 能力拆分注册。
    return new MedicalDataGateway(new MockMedicalDataConnector())
  }

  return new MedicalDataGateway(new MockMedicalDataConnector())
}
