import { MobileShell } from "@/components/resident/mobile-shell"

export default function ResidentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <MobileShell>{children}</MobileShell>
}
