"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Package, Plus, Users, Eye, Settings, Home, LogOut, Bell, CreditCard, ShoppingCart, DollarSign } from "lucide-react"
import { StatsCardSkeleton } from "@/components/StatsCardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"
import NotificationSystem from "@/components/NotificationSystem"
import { useAuth } from "@/contexts/AuthContext"
import { useDashboardStats, useEnquiries } from "@/hooks/use-api"
import { notificationService } from "@/lib/services/api"
import { sidebarLinks } from "@/lib/admin-links"
import AdminGuard from "@/components/AdminGuard"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

export default function AdminDashboard() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const { logout, user } = useAuth()
  const { data: statsResponse, loading: statsLoading } = useDashboardStats()
  const { data: enquiriesResponse, loading: enquiriesLoading } = useEnquiries({ limit: 5 })

  const cards = {
    totalEnquiries: statsResponse?.enquiries?.total ?? 0,
    pendingEnquiries: statsResponse?.enquiries?.new ?? 0,
    totalProducts: statsResponse?.products?.total ?? 0,
    totalUsers: 0,
  }
  const recentEnquiries = enquiriesResponse?.data || []

  useEffect(() => {
    let mounted = true
    notificationService.getNotificationStats().then((res) => {
      if (mounted && res.success) setUnreadNotifications(res.data.unread)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white border-r shadow-sm flex flex-col h-screen">
          <div className="p-6">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-[#0a6650]" />
              <span className="text-xl font-bold text-[#0a6650]">Admin Portal</span>
              <Badge variant="secondary" className="ml-2">v2.1</Badge>
            </Link>
          </div>
          <nav className="flex-1 px-4">
            <div className="space-y-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      link.href === "/" ? "bg-[#0a6650] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-[#0a6650]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className="p-4 border-t">
            <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full justify-start mb-2">
                <Eye className="h-4 w-4 mr-2" />
                View Website
              </Button>
            </a>
            <Button variant="outline" className="w-full justify-start" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col h-screen">
          <nav className="bg-white border-b shadow-sm">
            <div className="px-8 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Welcome {user?.name ? `back, ${user.name}` : "back"}! Here&apos;s what&apos;s happening.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={() => setShowNotifications(true)} className="relative">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs">{unreadNotifications}</Badge>
                    )}
                  </Button>
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-[#0a6650] hover:bg-[#084c3d]">Admin</Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {statsLoading ? (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                  ))}
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
                      <Users className="h-4 w-4 text-[#0a6650]" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cards.totalEnquiries}</div>
                      <p className="text-xs text-green-600">Live</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Enquiries</CardTitle>
                      <Package className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cards.pendingEnquiries}</div>
                      <p className="text-xs text-green-600">Live</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                      <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cards.totalProducts}</div>
                      <p className="text-xs text-green-600">Live</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Database className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{cards.totalUsers}</div>
                      <p className="text-xs text-green-600">Live</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Recent Enquiries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enquiriesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {recentEnquiries.map((enquiry: { id: string; name?: string; email?: string; subject?: string; status?: string }) => (
                          <div key={enquiry.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{enquiry.name}</h4>
                              <p className="text-sm text-gray-600">{enquiry.email}</p>
                              <p className="text-xs text-gray-500">{enquiry.subject}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-green-100 text-green-800">{enquiry.status || "pending"}</Badge>
                              <Link href="/enquiries">
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Link href="/enquiries">
                          <Button variant="outline" className="w-full">View All Enquiries</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/products/new">
                      <div className="p-6 rounded-lg border bg-gradient-to-br from-[#0a6650] to-[#084c3d] text-white hover:shadow-md transition-all duration-200 hover:scale-105 h-24 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Plus className="h-6 w-6" />
                          <span className="text-sm font-medium">Add Product</span>
                        </div>
                      </div>
                    </Link>
                    <Link href="/products">
                      <div className="p-6 rounded-lg border bg-white hover:shadow-md transition-all duration-200 hover:scale-105 h-24 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Package className="h-6 w-6 text-[#0a6650]" />
                          <span className="text-sm font-medium text-[#0a6650]">Manage Products</span>
                        </div>
                      </div>
                    </Link>
                    <Link href="/enquiries">
                      <div className="p-6 rounded-lg border bg-white hover:shadow-md transition-all duration-200 hover:scale-105 h-24 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Users className="h-6 w-6 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">View Enquiries</span>
                        </div>
                      </div>
                    </Link>
                    <Link href="/website">
                      <div className="p-6 rounded-lg border bg-white hover:shadow-md transition-all duration-200 hover:scale-105 h-24 flex items-center justify-center">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Eye className="h-6 w-6 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">Website Settings</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-yellow-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Website: Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Database: Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Storage: Healthy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <NotificationSystem isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
      </div>
    </AdminGuard>
  )
}
