export type ExternalSourceSystem =
  | "HIS"
  | "EMR"
  | "LIS"
  | "PACS"
  | "PUBLIC_HEALTH"
  | "APPOINTMENT"
  | "HEALTH_CARD"

export type ExternalDataStatus = "active" | "corrected" | "revoked" | "duplicated"

export type ExternalRecordMeta = {
  sourceSystem: ExternalSourceSystem
  sourceOrgCode?: string
  sourceRecordId: string
  eventTime?: Date
  ingestedAt: Date
  updatedAtFromSource?: Date
  dataStatus: ExternalDataStatus
  confidenceLevel: "high" | "medium" | "low"
  normalizedVersion: string
}

export type CanonicalDiagnosis = ExternalRecordMeta & {
  residentExternalId: string
  diagnosisCode?: string
  diagnosisText: string
  departmentName?: string
}

export type CanonicalMedication = ExternalRecordMeta & {
  residentExternalId: string
  medicationName: string
  dosage?: string
  frequency?: string
  startDate?: Date
  endDate?: Date
  note?: string
}

export type CanonicalLabResult = ExternalRecordMeta & {
  residentExternalId: string
  itemName: string
  value: string
  unit?: string
  referenceRange?: string
  abnormalFlag?: string
  reportDate?: Date
}

export type CanonicalMedicalRecord = ExternalRecordMeta & {
  residentExternalId: string
  institutionName: string
  departmentName: string
  chiefComplaint?: string
  diagnosisText?: string
  treatmentText?: string
  sourceType: string
}

export type CanonicalHealthSnapshot = {
  externalResidentId: string
  diagnoses: CanonicalDiagnosis[]
  medications: CanonicalMedication[]
  labResults: CanonicalLabResult[]
  medicalRecords: CanonicalMedicalRecord[]
}

export interface MedicalDataConnector {
  name: string
  fetchHealthSnapshot(input: {
    externalResidentId: string
    since?: Date
  }): Promise<CanonicalHealthSnapshot>
}
