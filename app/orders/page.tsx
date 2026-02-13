"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Database, 
  Search, 
  Eye, 
  MoreHorizontal, 
  Download, 
  RefreshCw,
  Package,
  CreditCard,
  Users,
  Settings,
  Home,
  ShoppingCart,
  LogOut,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AdminGuard from "@/components/AdminGuard"
import { useAuth } from "@/contexts/AuthContext"
import { useAllOrders, useOrderStats } from "@/hooks/use-api"
import { sidebarLinks } from "@/lib/admin-links"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

// Fallback data interface for display
interface DisplayOrder {
  id: string;
  customer: string;
  email: string;
  products: string[];
  total: number;
  status: string;
  paymentStatus: string;
  date: string;
  shippingAddress: string;
}

const fallbackOrders: DisplayOrder[] = [
  {
    id: "#3462",
    customer: "John Smith",
    email: "john@example.com",
    products: ["Solar Panel Kit 400W", "Mounting Hardware"],
    total: 949.98,
    status: "completed",
    paymentStatus: "paid",
    date: "2024-01-15",
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "#3461",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    products: ["Battery Storage System 10kWh"],
    total: 2499.99,
    status: "processing",
    paymentStatus: "paid",
    date: "2024-01-15",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
  },
  {
    id: "#3460",
    customer: "Mike Davis",
    email: "mike@example.com",
    products: ["Wind Turbine Generator 1000W", "Installation Kit"],
    total: 1399.98,
    status: "shipped",
    paymentStatus: "paid",
    date: "2024-01-14",
    shippingAddress: "789 Pine St, Chicago, IL 60601",
  },
  {
    id: "#3459",
    customer: "Emily Brown",
    email: "emily@example.com",
    products: ["Solar Panel Kit 600W Premium"],
    total: 1299.99,
    status: "completed",
    paymentStatus: "paid",
    date: "2024-01-14",
    shippingAddress: "321 Elm St, Houston, TX 77001",
  },
  {
    id: "#3458",
    customer: "David Wilson",
    email: "david@example.com",
    products: ["Smart Energy Monitor", "Cables"],
    total: 249.98,
    status: "pending",
    paymentStatus: "pending",
    date: "2024-01-13",
    shippingAddress: "654 Maple Dr, Phoenix, AZ 85001",
  },
]

export default function AdminOrdersPage() {
  const { logout, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  
  const { data: ordersData, loading, error } = useAllOrders({
    search: searchTerm || undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    page,
    limit
  })
  
  const { data: statsData } = useOrderStats()

  const filteredOrders = fallbackOrders.filter((order: DisplayOrder) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    const matchesPaymentStatus = selectedPaymentStatus === "all" || order.paymentStatus === selectedPaymentStatus

    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      processing: { variant: "default" as const, label: "Processing" },
      shipped: { variant: "outline" as const, label: "Shipped" },
      completed: { variant: "default" as const, label: "Completed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      paid: { variant: "default" as const, label: "Paid" },
      failed: { variant: "destructive" as const, label: "Failed" },
      refunded: { variant: "outline" as const, label: "Refunded" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const ordersToShow = ordersData?.data || fallbackOrders
  const pagination = ordersData?.pagination

  // Helper function to get display data from order
  const getOrderDisplayData = (order: any) => {
    if ('customer' in order) {
      // It's a DisplayOrder (fallback data)
      return order as DisplayOrder
    } else {
      // It's an actual Order from API
      return {
        id: order.orderNumber || order.id,
        customer: order.user?.name || 'N/A',
        email: order.user?.email || 'N/A',
        products: order.items?.map((item: any) => item.product?.name || 'Unknown') || [],
        total: typeof order.total === 'string' ? parseFloat(order.total) : order.total || 0,
        status: order.status || 'unknown',
        paymentStatus: order.paymentStatus || 'unknown',
        date: order.createdAt || order.updatedAt || new Date().toISOString(),
        shippingAddress: order.shippingAddress ? 
          `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}` 
          : 'N/A'
      }
    }
  }

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
                      link.href === "/orders" 
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
                  <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                  <p className="text-gray-600">Manage and track customer orders</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto p-8">

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders, customers, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersToShow.filter((order) => {
                  const displayData = getOrderDisplayData(order)
                  const matchesSearch = searchTerm === "" ||
                    displayData.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    displayData.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    displayData.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  const matchesStatus = selectedStatus === "all" || displayData.status === selectedStatus
                  const matchesPaymentStatus = selectedPaymentStatus === "all" || displayData.paymentStatus === selectedPaymentStatus
                  return matchesSearch && matchesStatus && matchesPaymentStatus
                }).map((order) => {
                  const displayData = getOrderDisplayData(order)
                  return (
                  <TableRow key={displayData.id}>
                    <TableCell className="font-mono font-medium">{displayData.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{displayData.customer}</p>
                        <p className="text-sm text-gray-600">{displayData.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {displayData.products.map((product: string, index: number) => (
                          <p key={index} className="text-sm truncate">
                            {product}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${displayData.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(displayData.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(displayData.paymentStatus)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{displayData.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {ordersToShow.filter((order) => {
              const displayData = getOrderDisplayData(order)
              const matchesSearch = searchTerm === "" ||
                displayData.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                displayData.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                displayData.email?.toLowerCase().includes(searchTerm.toLowerCase())
              const matchesStatus = selectedStatus === "all" || displayData.status === selectedStatus
              const matchesPaymentStatus = selectedPaymentStatus === "all" || displayData.paymentStatus === selectedPaymentStatus
              return matchesSearch && matchesStatus && matchesPaymentStatus
            }).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedStatus("all")
                    setSelectedPaymentStatus("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
