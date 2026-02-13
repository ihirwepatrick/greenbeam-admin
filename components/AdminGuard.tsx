"use client"

import { ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AdminLoginForm from "./AdminLoginForm"

interface AdminGuardProps {
	children: ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
	const { user, isAuthenticated, isLoading } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		console.log("AdminGuard: Auth state change:", { 
			isLoading, 
			isAuthenticated, 
			userRole: user?.role, 
			userRoleType: typeof user?.role,
			userRoleLength: user?.role?.length,
			userRoleCharCodes: user?.role ? Array.from(user.role).map(c => c.charCodeAt(0)) : null,
			pathname,
			user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null
		})
		
		if (isLoading) {
			console.log("AdminGuard: Still loading, returning early")
			return
		}
		
		// Debug the exact role value
		if (isAuthenticated && user) {
			console.log("AdminGuard: Detailed role analysis:", {
				role: user.role,
				roleJSON: JSON.stringify(user.role),
				isAdmin: user.role === "admin",
				isAdminTrimmed: user.role?.trim() === "admin",
				isAdminLowerCase: user.role?.toLowerCase() === "admin",
				isAdminTrimmedLowerCase: user.role?.trim().toLowerCase() === "admin"
			})
		}
		
		// If logged in but not admin, send to homepage
		if (isAuthenticated && user) {
			const userRole = user.role?.trim().toLowerCase()
			const isAdmin = userRole === "admin" || userRole === "administrator"
			
			if (!isAdmin) {
				console.log("AdminGuard: Non-admin user detected, redirecting to homepage")
				console.log("AdminGuard: User role comparison:", { 
					userRole: user.role, 
					normalizedRole: userRole,
					expected: "admin", 
					isAdmin: isAdmin
				})
				router.replace("/login")
			} else {
				console.log("AdminGuard: Admin user confirmed, allowing access")
			}
		}
	}, [isAuthenticated, isLoading, user, router, pathname])

	if (isLoading) {
		console.log("AdminGuard: Loading state, showing spinner")
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
			</div>
		)
	}

	if (!isAuthenticated) {
		console.log("AdminGuard: Not authenticated, showing login form")
		return <AdminLoginForm />
	}

	if (user) {
		const userRole = user.role?.trim().toLowerCase()
		const isAdmin = userRole === "admin" || userRole === "administrator"
		
		if (!isAdmin) {
			console.log("AdminGuard: User is not admin, showing nothing")
			return null
		}
	}

	console.log("AdminGuard: Admin user authenticated, showing admin content")
	return <>{children}</>
} 