import { prisma } from "@/lib/db/prisma"

import type {
  CanonicalHealthSnapshot,
  ExternalRecordMeta,
  MedicalDataConnector,
} from "../types"

const normalizedVersion = "mock-normalizer-v0.1"

export class MockMedicalDataConnector implements MedicalDataConnector {
  name = "mock-medical-data-connector"

  async fetchHealthSnapshot(input: {
    externalResidentId: string
    since?: Date
  }): Promise<CanonicalHealthSnapshot> {
    const resident = await prisma.residentProfile.findUnique({
      where: { id: input.externalResidentId },
      include: {
        diagnoses: true,
        medications: true,
        labResults: true,
        medicalRecords: true,
      },
    })

    if (!resident) {
      return {
        externalResidentId: input.externalResidentId,
        diagnoses: [],
        medications: [],
        labResults: [],
        medicalRecords: [],
      }
    }

    return {
      externalResidentId: resident.id,
      diagnoses: resident.diagnoses.map((diagnosis) => ({
        ...baseMeta("EMR", diagnosis.id, diagnosis.createdAt),
        residentExternalId: resident.id,
        diagnosisText: diagnosis.name,
        diagnosisCode: diagnosis.code ?? undefined,
      })),
      medications: resident.medications.map((medication) => ({
        ...baseMeta("EMR", medication.id, medication.createdAt),
        residentExternalId: resident.id,
        medicationName: medication.name,
        dosage: medication.dosage ?? undefined,
        frequency: medication.frequency ?? undefined,
        startDate: medication.startDate ?? undefined,
        endDate: medication.endDate ?? undefined,
        note: medication.notes ?? undefined,
      })),
      labResults: resident.labResults.map((labResult) => ({
        ...baseMeta("LIS", labResult.id, labResult.createdAt),
        residentExternalId: resident.id,
        itemName: labResult.itemName,
        value: labResult.value,
        unit: labResult.unit ?? undefined,
        referenceRange: labResult.referenceRange ?? undefined,
        abnormalFlag: labResult.abnormalFlag ?? undefined,
        reportDate: labResult.resultDate,
      })),
      medicalRecords: resident.medicalRecords.map((record) => ({
        ...baseMeta("EMR", record.id, record.createdAt),
        residentExternalId: resident.id,
        institutionName: record.institutionName,
        departmentName: record.departmentName,
        chiefComplaint: record.chiefComplaint ?? undefined,
        diagnosisText: record.diagnosisText ?? undefined,
        treatmentText: record.treatmentText ?? undefined,
        sourceType: record.sourceType,
      })),
    }
  }
}

function baseMeta(
  sourceSystem: ExternalRecordMeta["sourceSystem"],
  sourceRecordId: string,
  ingestedAt: Date
): ExternalRecordMeta {
  return {
    sourceSystem,
    sourceRecordId,
    ingestedAt,
    dataStatus: "active",
    confidenceLevel: "high",
    normalizedVersion,
  }
}
