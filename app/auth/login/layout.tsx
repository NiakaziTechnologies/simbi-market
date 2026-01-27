import { Suspense } from 'react'

// Login page doesn't need any layout wrapper - it's a standalone page
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>}>{children}</Suspense>
}
