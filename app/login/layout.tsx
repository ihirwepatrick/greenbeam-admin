// Force dynamic rendering so useSearchParams() in AdminLoginForm works during build.
export const dynamic = "force-dynamic"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
