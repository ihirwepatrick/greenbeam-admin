"use client"

import { useState, useEffect } from "react"
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
  Save,
  User,
  Shield,
  Bell,
  Key,
  Mail,
  Phone,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertCircle,
  Lock,
  EyeOff,
  Trash2,
  Download,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/lib/services/api"
import { sidebarLinks } from "@/lib/admin-links"
import AdminGuard from "@/components/AdminGuard"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

const adminProfile = {
  name: "Admin User",
  email: "admin@greenbeam.com",
  phone: "+250 788 123 456",
  role: "Administrator",
  lastLogin: "2024-01-15 10:30 AM",
  avatar: "/admin-avatar.png"
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saveMessage, setSaveMessage] = useState("")

  const { user, logout, refreshUser } = useAuth()
  
  // Initialize profile with user data
  const [profile, setProfile] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@greenbeam.com",
    phone: "+250 788 123 456",
    role: user?.role || "Administrator",
    lastLogin: new Date().toLocaleString(),
    avatar: "/admin-avatar.png"
  })

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role || prev.role
      }))
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage("")
    try {
      // Profile update API can be wired here when available
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveMessage("Profile updated successfully!")
      toast.success("Profile updated successfully.")
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update profile."
      setSaveMessage(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setSaveMessage("New passwords don't match!")
      setTimeout(() => setSaveMessage(""), 3000)
      return
    }
    
    if (newPassword.length < 6) {
      setSaveMessage("Password must be at least 6 characters!")
      setTimeout(() => setSaveMessage(""), 3000)
      return
    }

    setIsSaving(true)
    setSaveMessage("")
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword
      })
      if (response.success) {
        setSaveMessage("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast.success("Password changed successfully.")
      } else {
        const msg = "Failed to change password. Please check your current password."
        setSaveMessage(msg)
        toast.error(msg)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to change password. Please try again."
      setSaveMessage(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(""), 5000)
    }
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "backup", name: "Backup", icon: Download },
  ]

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
                    link.href === "/settings" 
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
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account and system preferences</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#0a6650] hover:bg-[#084c3d]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" className="bg-[#0a6650] hover:bg-[#084c3d]">
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Settings Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-white text-[#0a6650] shadow-sm"
                        : "text-gray-600 hover:text-[#0a6650]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{profile.name}</h3>
                      <p className="text-gray-600">{profile.role}</p>
                      <p className="text-sm text-gray-500">Last login: {profile.lastLogin}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    className="bg-[#0a6650] hover:bg-[#084c3d]"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Management</h4>
                      <p className="text-sm text-gray-600">Manage active sessions and devices</p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-gray-600">View recent login attempts</p>
                    </div>
                    <Button variant="outline">View History</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Enquiry Notifications</h4>
                      <p className="text-sm text-gray-600">Get notified when new enquiries are received</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Product Updates</h4>
                      <p className="text-sm text-gray-600">Receive notifications about product changes</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Alerts</h4>
                      <p className="text-sm text-gray-600">Important system notifications and updates</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-gray-600">Receive weekly summary reports</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    In-App Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Dashboard Alerts</h4>
                      <p className="text-sm text-gray-600">Show notifications on the dashboard</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sound Notifications</h4>
                      <p className="text-sm text-gray-600">Play sound for new notifications</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Data Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Last Backup</h4>
                      <p className="text-sm text-gray-600">2024-01-15 10:30 AM</p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto Backup</h4>
                      <p className="text-sm text-gray-600">Automatically backup data daily</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-[#0a6650]" defaultChecked />
                  </div>
                  <Button className="bg-[#0a6650] hover:bg-[#084c3d]">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Data Import
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="importFile">Import Data</Label>
                    <Input
                      id="importFile"
                      type="file"
                      accept=".json,.csv"
                    />
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-600">Delete Account</h4>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Status */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">System: Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Database: Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Storage: 2.3GB used</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AdminGuard>
  )
} 