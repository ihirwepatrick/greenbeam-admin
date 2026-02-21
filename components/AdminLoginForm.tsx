"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, login, user } = useAuth()

  const redirect = searchParams.get("redirect") || "/"

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.trim().toLowerCase()
      const isAdmin = userRole === "admin" || userRole === "administrator"
      if (isAdmin) router.replace(redirect)
    }
  }, [isAuthenticated, user, redirect, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)
    try {
      const ok = await login(email, password)
      if (ok) setSuccess(true)
      else setError("Invalid email or password. Please try again.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Leaf className="h-10 w-10 text-[#0a6650]" />
            <span className="text-2xl font-bold text-[#0a6650]">Greenbeam Admin</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">Admin access only</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  Login successful. Redirecting to dashboard…
                </div>
              )}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="admin@greenbeam.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" placeholder="Enter your password" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full bg-[#0a6650] hover:bg-[#084c3d]" disabled={isLoading || success}>
                  {success ? "Redirecting..." : isLoading ? "Signing in..." : "Sign in to Dashboard"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {process.env.NODE_ENV !== "production" && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo credentials (dev only)</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Email:</strong> admin@greenbeam.com</p>
                <p><strong>Password:</strong> admin123456</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
