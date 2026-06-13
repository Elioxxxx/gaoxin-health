import { prisma } from "@/lib/db/prisma"

export function listInstitutionsForResources() {
  return prisma.institution.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      departments: true,
      doctors: true,
      serviceCapabilities: true,
    },
  })
}

export function getInstitutionDetails(id: string) {
  return prisma.institution.findUnique({
    where: { id },
    include: {
      departments: { include: { doctors: true } },
      doctors: {
        include: {
          institution: true,
          department: true,
        },
      },
      serviceCapabilities: true,
    },
  })
}

export function listDoctorsForResources() {
  return prisma.doctor.findMany({
    orderBy: [{ isExpert: "desc" }, { name: "asc" }],
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })
}

export function getDoctorDetails(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      institution: true,
      department: true,
      expertPool: true,
    },
  })
}

export function getGuidePlanDetails(id: string) {
  return prisma.guidePlan.findUnique({
    where: { id },
    include: {
      recommendation: {
        include: {
          institution: true,
          department: true,
          doctor: true,
        },
      },
      session: true,
    },
  })
}
