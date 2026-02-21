"use client"

import { useState } from 'react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Search, 
  Eye, 
  Edit,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Home,
  Package,
  Settings,
  ShoppingCart,
  LogOut
} from 'lucide-react'
import { toast } from "sonner"
import { useAllPayments, usePaymentStats } from "@/hooks/use-api"
import { Payment } from "@/lib/types/api"
import { TableSkeleton } from "@/components/TableSkeleton"
import AdminGuard from "@/components/AdminGuard"
import { useAuth } from "@/contexts/AuthContext"
import { sidebarLinks } from "@/lib/admin-links"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

export default function AdminPaymentsPage() {
  const { logout, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  
  const { data: paymentsData, loading, error } = useAllPayments({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter as any,
    page,
    limit
  })
  
  const { data: statsData } = usePaymentStats()

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'PROCESSING':
        return <CreditCard className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4" />
      case 'REFUNDED':
        return <ArrowDownRight className="h-4 w-4" />
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'stripe':
        return <CreditCard className="h-4 w-4" />
      case 'paypal':
        return <DollarSign className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const payments = (paymentsData as any)?.payments ?? []
  const pagination = (paymentsData as any)?.pagination

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
                      link.href === "/payments" 
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
                  <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                  <p className="text-gray-600">Manage all payment transactions</p>
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
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold">{statsData.totalPayments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(statsData.totalRevenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Successful Payments</p>
                  <p className="text-2xl font-bold">{statsData.successfulPayments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed Payments</p>
                  <p className="text-2xl font-bold">{statsData.failedPayments || 0}</p>
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
            placeholder="Search by transaction ID, order number, or customer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
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
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading payments</h2>
          <p className="text-gray-600 mb-6">There was an error loading the payment data.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No payments found</h2>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No payments exist yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Payments List */}
          <div className="space-y-6">
            {payments.map((payment: Payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-semibold">Transaction #{payment.transactionId || payment.id}</p>
                        <p className="text-sm text-gray-500">
                          Order: #{payment.order?.orderNumber || 'N/A'} • Customer: {payment.order?.user?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Payment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Payment Information</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="flex items-center space-x-1">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span>{payment.paymentMethod}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Currency:</span>
                          <span>{payment.currency}</span>
                        </div>
                        {payment.metadata?.stripePaymentIntentId && (
                          <div className="flex justify-between">
                            <span>Stripe Intent:</span>
                            <span className="font-mono text-xs">{payment.metadata.stripePaymentIntentId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Order Summary</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Order Number:</span>
                          <span>{payment.order?.orderNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Order Total:</span>
                          <span>{payment.order ? formatCurrency(payment.order.total) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Amount:</span>
                          <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        </div>
                        {payment.refundAmount && parseFloat(payment.refundAmount) > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Refunded:</span>
                            <span>-{formatCurrency(payment.refundAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Customer Email</p>
                      <p className="font-medium">{payment.order?.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Processing Time</p>
                      <p className="font-medium">
                        {payment.updatedAt ? formatDate(payment.updatedAt) : 'Not processed'}
                      </p>
                    </div>
                    {payment.metadata?.failureReason && (
                      <div>
                        <p className="text-gray-500">Failure Reason</p>
                        <p className="font-medium text-red-600">{payment.metadata.failureReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {payment.status === 'COMPLETED' && (
                      <Button variant="outline" size="sm">
                        <ArrowDownRight className="h-4 w-4 mr-2" />
                        Process Refund
                      </Button>
                    )}
                    {payment.status === 'PENDING' && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
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