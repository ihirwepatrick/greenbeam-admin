"use client"

import { useState } from 'react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Trash2,
  Plus,
  Minus,
  Users,
  Package,
  DollarSign,
  Calendar,
  AlertCircle,
  RefreshCw,
  Database,
  Home,
  Settings,
  CreditCard,
  LogOut,
  Bell
} from 'lucide-react'
import { toast } from "sonner"
import { useAllCarts, useCartStats } from "@/hooks/use-api"
import { Cart } from "@/lib/types/api"
import { TableSkeleton } from "@/components/TableSkeleton"
import AdminGuard from "@/components/AdminGuard"
import { useAuth } from "@/contexts/AuthContext"
import { formatRWF } from "@/lib/utils"
import { sidebarLinks } from "@/lib/admin-links"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

export default function AdminCartsPage() {
  const { logout, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  
  const { data: cartsData, loading, error } = useAllCarts({
    search: searchTerm || undefined,
    page,
    limit
  })
  
  const { data: statsData } = useCartStats()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const carts = (cartsData as any)?.carts ?? []
  const pagination = (cartsData as any)?.pagination

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar - Fixed */}
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
                      link.href === "/carts" 
                        ? "bg-[#0a6650] text-white" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-[#0a6650]"
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Top Navigation - Fixed */}
          <nav className="bg-white border-b shadow-sm">
            <div className="px-8 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
                  <p className="text-gray-600">Manage all user shopping carts</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto p-8">

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Carts</p>
                  <p className="text-2xl font-bold">{statsData.totalCarts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{statsData.activeUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{statsData.totalItems || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">${statsData.totalValue || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by user email or cart ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading carts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading carts</h2>
          <p className="text-gray-600 mb-6">There was an error loading the cart data.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : carts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No carts found</h2>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search.' : 'No shopping carts exist yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Carts List */}
          <div className="space-y-6">
            {carts.map((cart: Cart) => (
              <Card key={cart.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold">Cart #{cart.id}</p>
                          <p className="text-sm text-gray-500">User ID: {cart.userId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
                        </Badge>
                        <Badge variant="outline">
                          {formatRWF(cart.total)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(cart.updatedAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Cart Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-3">Items</h4>
                    <div className="space-y-2">
                      {cart.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                ${item.price} each
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-semibold">{formatRWF(item.total)}</p>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {cart.items.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{cart.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cart Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="font-semibold">${cart.subtotal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="font-semibold">{cart.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold">{formatDate(cart.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-4 pt-4 border-t space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} carts
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}