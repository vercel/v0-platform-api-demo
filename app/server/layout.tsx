// app/server/layout.tsx

import { Providers } from '../providers'

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}