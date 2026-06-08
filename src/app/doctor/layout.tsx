import { DoctorShell } from "@/components/doctor/doctor-shell"

export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DoctorShell>{children}</DoctorShell>
}
