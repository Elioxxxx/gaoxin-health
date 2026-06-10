import { prisma } from "@/lib/db/prisma"

async function main() {
  const residentCount = await prisma.residentProfile.count()

  if (residentCount === 0) {
    console.log("Seed required: no resident profiles found.")
    process.exitCode = 1
    return
  }

  console.log(`Seed skipped: found ${residentCount} resident profiles.`)
}

main()
  .catch((error) => {
    console.error("Seed required: unable to verify database contents.", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
