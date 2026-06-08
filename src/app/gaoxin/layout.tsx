import { GaoxinMiniShell } from "@/components/gaoxin/gaoxin-mini-shell"

export default function GaoxinLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <GaoxinMiniShell>{children}</GaoxinMiniShell>
}
