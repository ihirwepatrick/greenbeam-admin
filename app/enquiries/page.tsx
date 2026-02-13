"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Database,
  Package,
  Users,
  Eye,
  Settings,
  Home,
  LogOut,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Send,
  Archive,
  Star,
  MapPin,
  Bell,
} from "lucide-react"
import NotificationSystem from "@/components/NotificationSystem"
import EmailService from "@/components/EmailService"
import { useEnquiries, useDashboardStats } from "@/hooks/use-api"
import { useAuth } from "@/contexts/AuthContext"
import { enquiryService } from "@/lib/services/api"
import { sidebarLinks } from "@/lib/admin-links"
import AdminGuard from "@/components/AdminGuard"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

const enquiriesSeed = [
  {
    id: "ENQ-001",
    customerName: "John Smith",
    email: "john.smith@email.com",
    phone: "+250 788 123 456",
    product: "Solar Panel Kit 400W",
    subject: "Product Availability Inquiry",
    message: "Hi, I'm interested in the Solar Panel Kit 400W. Could you please provide information about availability, pricing, and installation options? Also, what warranty do you offer?",
    status: "New",
    priority: "High",
    createdAt: "2024-01-15 10:30 AM",
    lastUpdated: "2024-01-15 10:30 AM",
    location: "Kigali, Rwanda",
    source: "Website Contact Form"
  },
  {
    id: "ENQ-002",
    customerName: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+250 788 234 567",
    product: "Wind Turbine Generator 1000W",
    subject: "Technical Specifications",
    message: "I need detailed technical specifications for the Wind Turbine Generator 1000W. What are the power output specifications and installation requirements?",
    status: "In Progress",
    priority: "Medium",
    createdAt: "2024-01-14 02:15 PM",
    lastUpdated: "2024-01-15 09:45 AM",
    location: "Butare, Rwanda",
    source: "Phone Call"
  },
  {
    id: "ENQ-003",
    customerName: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+250 788 345 678",
    product: "Battery Storage System 10kWh",
    subject: "Bulk Order Inquiry",
    message: "We're looking to purchase multiple Battery Storage Systems for a commercial project. Can you provide bulk pricing and delivery timeline?",
    status: "Responded",
    priority: "High",
    createdAt: "2024-01-13 11:20 AM",
    lastUpdated: "2024-01-14 03:30 PM",
    location: "Musanze, Rwanda",
    source: "Email"
  },
  {
    id: "ENQ-004",
    customerName: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+250 788 456 789",
    product: "Hybrid Inverter 5000W",
    subject: "Installation Service",
    message: "Do you provide installation services for the Hybrid Inverter 5000W? What's the installation cost and timeline?",
    status: "Closed",
    priority: "Low",
    createdAt: "2024-01-12 04:45 PM",
    lastUpdated: "2024-01-13 01:15 PM",
    location: "Kigali, Rwanda",
    source: "Website Contact Form"
  },
  {
    id: "ENQ-005",
    customerName: "David Kim",
    email: "david.kim@email.com",
    phone: "+250 788 567 890",
    product: "Monitoring System Pro",
    subject: "System Integration",
    message: "I need help integrating the Monitoring System Pro with existing solar installations. Do you offer technical support?",
    status: "New",
    priority: "Medium",
    createdAt: "2024-01-15 08:20 AM",
    lastUpdated: "2024-01-15 08:20 AM",
    location: "Gisenyi, Rwanda",
    source: "Email"
  }
]

const statusOptions = ["All", "New", "In Progress", "Responded", "Closed"]
const priorityOptions = ["All", "High", "Medium", "Low"]

export default function AdminEnquiries() {
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [isSendingResponse, setIsSendingResponse] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)

  const { logout, user } = useAuth()
  const { data: apiEnquiriesResponse, loading: enquiriesLoading, execute: refetchEnquiries } = useEnquiries({ limit: 50 })
  const { data: statsResponse, loading: statsLoading } = useDashboardStats()
  
  const normalizeStatusLabel = (value: string | undefined) => {
    const v = (value || '').toUpperCase()
    if (v === 'NEW' || v === 'PENDING') return 'New'
    if (v === 'IN_PROGRESS' || v === 'IN-PROGRESS' || v === 'ASSIGNED') return 'In Progress'
    if (v === 'RESPONDED' || v === 'RESOLVED') return 'Responded'
    if (v === 'CLOSED') return 'Closed'
    return 'New'
  }

  const normalizePriorityLabel = (value: string | undefined) => {
    const v = (value || '').toUpperCase()
    if (v === 'HIGH') return 'High'
    if (v === 'LOW') return 'Low'
    return 'Medium'
  }
  
  // Map API enquiries to component format
  const mappedApiEnquiries = (apiEnquiriesResponse?.data || []).map((e: any) => ({
    id: e.id,
    customerName: e.customerName || e.name,
    email: e.email,
    phone: e.phone || "",
    product: e.product || "",
    subject: e.subject,
    message: e.message,
    status: normalizeStatusLabel(e.status),
    priority: normalizePriorityLabel(e.priority),
    createdAt: e.createdAt,
    lastUpdated: e.updatedAt,
    location: e.location || "",
    source: e.source || "API"
  }))
  
  // Use API data if available, fallback to seed data for demo
  const enquiries = mappedApiEnquiries.length ? mappedApiEnquiries : enquiriesSeed
  
  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalEnquiries = enquiries.length
    const newEnquiries = enquiries.filter(e => e.status === "pending" || e.status === "new").length
    const inProgress = enquiries.filter(e => e.status === "in-progress" || e.status === "assigned").length
    const resolved = enquiries.filter(e => e.status === "resolved" || e.status === "completed").length
    
    return {
      total: totalEnquiries,
      new: newEnquiries,
      inProgress: inProgress,
      resolved: resolved
    }
  }, [enquiries])
  
  // Use dashboard stats if available, fallback to calculated stats
  const displayStats = statsResponse ? {
    total: statsResponse.enquiries?.total ?? stats.total,
    new: statsResponse.enquiries?.new ?? stats.new,
    inProgress: statsResponse.enquiries?.inProgress ?? stats.inProgress,
    resolved: ((statsResponse.enquiries?.responded ?? 0) + (statsResponse.enquiries?.closed ?? 0)) || stats.resolved
  } : stats

  const handleViewDetails = (enquiry: any) => {
    setSelectedEnquiry(enquiry)
    setShowDetailsModal(true)
  }

  const handleRespond = (enquiry: any) => {
    setSelectedEnquiry(enquiry)
    setShowResponseModal(true)
  }

  const closeModal = () => {
    setShowDetailsModal(false)
    setShowResponseModal(false)
    setSelectedEnquiry(null)
    setResponseMessage("")
  }

  const sendResponse = async () => {
    if (!responseMessage.trim() || !selectedEnquiry) return

    try {
      setIsSendingResponse(true)
      const payload = {
        message: responseMessage.trim(),
      }
      const res = await enquiryService.respondToEnquiry(selectedEnquiry.id, payload)
      if (res.success) {
        await refetchEnquiries()
        console.log('Response sent successfully (email dispatched by backend).')
      } else {
        console.warn('Response API did not return success; check backend logs.')
      }
      setResponseMessage("")
      setShowResponseModal(false)
      setSelectedEnquiry(null)
    } catch (error) {
      console.error("Failed to send response:", error)
    } finally {
      setIsSendingResponse(false)
    }
  }

  const updateStatus = (enquiryId: string, newStatus: string) => {
    // Here you would typically update the status in database
    console.log("Updating status for:", enquiryId, "to:", newStatus)
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesStatus = statusFilter === "All" || enquiry.status === statusFilter
    const matchesPriority = priorityFilter === "All" || enquiry.priority === priorityFilter
    const matchesSearch = enquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.product.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800"
      case "In Progress": return "bg-yellow-100 text-yellow-800"
      case "Responded": return "bg-green-100 text-green-800"
      case "Closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
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
                    link.href === "/enquiries" 
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
          <Button variant="outline" className="w-full justify-start">
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
                <h1 className="text-2xl font-bold text-gray-900">Enquiry Management</h1>
                <p className="text-gray-600">Manage and respond to customer enquiries</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs">
                    2
                  </Badge>
                </Button>
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button size="sm" className="bg-[#0a6650] hover:bg-[#084c3d]">
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {statsLoading ? "Loading..." : "Live count"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.new}</div>
                <p className="text-xs text-muted-foreground">
                  Pending review
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Being processed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.resolved}</div>
                <p className="text-xs text-muted-foreground">
                  Completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search enquiries by customer name, subject, or product..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    {priorityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enquiries List */}
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <Card key={enquiry.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-semibold text-lg">{enquiry.customerName}</h3>
                        <Badge className={getStatusColor(enquiry.status)}>
                          {enquiry.status}
                        </Badge>
                        <Badge className={getPriorityColor(enquiry.priority)}>
                          {enquiry.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <Mail className="h-4 w-4 inline mr-1" />
                            {enquiry.email}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <Phone className="h-4 w-4 inline mr-1" />
                            {enquiry.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {enquiry.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <Package className="h-4 w-4 inline mr-1" />
                            {enquiry.product}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {enquiry.createdAt}
                          </p>
                          <p className="text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            {enquiry.source}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">{enquiry.subject}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{enquiry.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(enquiry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRespond(enquiry)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <select
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                        value={enquiry.status}
                        onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Responded">Responded</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-gray-600">
              Showing 1-{filteredEnquiries.length} of {filteredEnquiries.length} enquiries
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Details Modal */}
      {showDetailsModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEnquiry.customerName}</h2>
                  <p className="text-gray-600">{selectedEnquiry.subject}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-gray-500" />
                        <span>{selectedEnquiry.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-gray-500" />
                        <span>{selectedEnquiry.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                        <span>{selectedEnquiry.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Enquiry Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-3 text-gray-500" />
                        <span>{selectedEnquiry.product}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                        <span>Created: {selectedEnquiry.createdAt}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-3 text-gray-500" />
                        <span>Source: {selectedEnquiry.source}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Message</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedEnquiry.message}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedEnquiry.status)}>
                        {selectedEnquiry.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Priority:</span>
                      <Badge className={getPriorityColor(selectedEnquiry.priority)}>
                        {selectedEnquiry.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Last Updated:</span>
                      <span>{selectedEnquiry.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      className="flex-1 bg-[#0a6650] hover:bg-[#084c3d]"
                      onClick={() => {
                        closeModal()
                        handleRespond(selectedEnquiry)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Respond
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => updateStatus(selectedEnquiry.id, "Closed")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Send Response</h2>
                  <p className="text-gray-600">Reply to {selectedEnquiry.customerName}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="to">To:</Label>
                  <Input
                    id="to"
                    value={selectedEnquiry.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject:</Label>
                  <Input
                    id="subject"
                    value={`Re: ${selectedEnquiry.subject}`}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Response Message:</Label>
                  <Textarea
                    id="message"
                    rows={8}
                    placeholder="Type your response here..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-[#0a6650] hover:bg-[#084c3d]"
                  onClick={sendResponse}
                  disabled={!responseMessage.trim() || isSendingResponse}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSendingResponse ? 'Sending...' : 'Send Response'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
    </AdminGuard>
  )
} 