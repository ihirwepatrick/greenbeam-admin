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
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Palette,
  FileText,
  Shield,
  Bell,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/hooks/use-api"
import { settingsService } from "@/lib/services/api"
import { sidebarLinks } from "@/lib/admin-links"
import AdminGuard from "@/components/AdminGuard"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

const websiteSettings = {
  general: {
    siteName: "Greenbeam",
    siteDescription: "Leading provider of sustainable energy solutions for homes and businesses in Rwanda",
    siteUrl: "https://greenbeam.com",
    contactEmail: "info@greenbeam.com",
    contactPhone: "+250 788 123 456",
    address: "Kigali ST RN 1000, Kigali, Rwanda",
    businessHours: "Monday - Friday: 8:00 AM - 6:00 PM CAT",
  },
  branding: {
    primaryColor: "#0a6650",
    secondaryColor: "#084c3d",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
  },
  content: {
    heroTitle: "Power Your Future with Clean Energy",
    heroSubtitle: "Discover our premium collection of solar panels, wind turbines, and energy storage solutions",
    aboutTitle: "About Greenbeam",
    aboutDescription: "We're on a mission to accelerate the world's transition to sustainable energy",
    footerText: "© 2024 Greenbeam. All rights reserved. | Kigali, Rwanda",
  },
  seo: {
    metaTitle: "Greenbeam - Sustainable Energy Solutions in Rwanda",
    metaDescription: "Leading provider of solar panels, wind turbines, and energy storage solutions in Rwanda",
    keywords: "solar panels, wind energy, renewable energy, Rwanda, green energy",
    googleAnalytics: "GA-XXXXXXXXX",
  },
  social: {
    facebook: "https://facebook.com/greenbeam",
    twitter: "https://twitter.com/greenbeam",
    linkedin: "https://linkedin.com/company/greenbeam",
    instagram: "https://instagram.com/greenbeam",
  }
}

export default function AdminWebsite() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const { user, logout } = useAuth()
  const { data: websiteSettingsData, loading: settingsLoading } = useSettings('website')
  
  // Initialize with static settings, then update with API data
  const [settings, setSettings] = useState(websiteSettings)

  // Update settings when API data is loaded
  useEffect(() => {
    if (websiteSettingsData?.data) {
      setSettings(prev => ({
        ...prev,
        ...websiteSettingsData.data
      }))
    }
  }, [websiteSettingsData])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage("")
    try {
      // Persist website settings to backend
      const response = await settingsService.updateSettingsByCategory('website', settings)
      if (!response.success) {
        throw new Error(response?.error?.message || 'Failed to save website settings')
      }
      
      setSaveMessage("Website settings saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage("Error saving settings")
      setTimeout(() => setSaveMessage(""), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "branding", name: "Branding", icon: Palette },
    { id: "content", name: "Content", icon: FileText },
    { id: "seo", name: "SEO", icon: Monitor },
    { id: "social", name: "Social Media", icon: Users },
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
                    link.href === "/website" 
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
                <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
                <p className="text-gray-600">Manage website content, branding, and configuration</p>
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
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
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

          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    General Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteUrl">Site URL</Label>
                      <Input
                        id="siteUrl"
                        value={settings.general.siteUrl}
                        onChange={(e) => updateSetting("general", "siteUrl", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      rows={3}
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting("general", "siteDescription", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSetting("general", "contactEmail", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={settings.general.contactPhone}
                        onChange={(e) => updateSetting("general", "contactPhone", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={settings.general.address}
                      onChange={(e) => updateSetting("general", "address", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <Input
                      id="businessHours"
                      value={settings.general.businessHours}
                      onChange={(e) => updateSetting("general", "businessHours", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Branding Settings */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Brand Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primaryColor"
                          value={settings.branding.primaryColor}
                          onChange={(e) => updateSetting("branding", "primaryColor", e.target.value)}
                        />
                        <div 
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: settings.branding.primaryColor }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondaryColor"
                          value={settings.branding.secondaryColor}
                          onChange={(e) => updateSetting("branding", "secondaryColor", e.target.value)}
                        />
                        <div 
                          className="w-12 h-10 rounded border"
                          style={{ backgroundColor: settings.branding.secondaryColor }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Logo & Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={settings.branding.logoUrl}
                        onChange={(e) => updateSetting("branding", "logoUrl", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="faviconUrl">Favicon URL</Label>
                      <Input
                        id="faviconUrl"
                        value={settings.branding.faviconUrl}
                        onChange={(e) => updateSetting("branding", "faviconUrl", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Settings */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Hero Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={settings.content.heroTitle}
                      onChange={(e) => updateSetting("content", "heroTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Textarea
                      id="heroSubtitle"
                      rows={3}
                      value={settings.content.heroSubtitle}
                      onChange={(e) => updateSetting("content", "heroSubtitle", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    About Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="aboutTitle">About Title</Label>
                    <Input
                      id="aboutTitle"
                      value={settings.content.aboutTitle}
                      onChange={(e) => updateSetting("content", "aboutTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutDescription">About Description</Label>
                    <Textarea
                      id="aboutDescription"
                      rows={4}
                      value={settings.content.aboutDescription}
                      onChange={(e) => updateSetting("content", "aboutDescription", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Footer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input
                      id="footerText"
                      value={settings.content.footerText}
                      onChange={(e) => updateSetting("content", "footerText", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="h-5 w-5 mr-2" />
                    SEO Meta Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={settings.seo.metaTitle}
                      onChange={(e) => updateSetting("seo", "metaTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      rows={3}
                      value={settings.seo.metaDescription}
                      onChange={(e) => updateSetting("seo", "metaDescription", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={settings.seo.keywords}
                      onChange={(e) => updateSetting("seo", "keywords", e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                    <Input
                      id="googleAnalytics"
                      value={settings.seo.googleAnalytics}
                      onChange={(e) => updateSetting("seo", "googleAnalytics", e.target.value)}
                      placeholder="GA-XXXXXXXXX"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Social Media Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook URL</Label>
                      <Input
                        id="facebook"
                        value={settings.social.facebook}
                        onChange={(e) => updateSetting("social", "facebook", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter URL</Label>
                      <Input
                        id="twitter"
                        value={settings.social.twitter}
                        onChange={(e) => updateSetting("social", "twitter", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        value={settings.social.linkedin}
                        onChange={(e) => updateSetting("social", "linkedin", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram URL</Label>
                      <Input
                        id="instagram"
                        value={settings.social.instagram}
                        onChange={(e) => updateSetting("social", "instagram", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Website Preview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Website Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Mobile</p>
                </div>
                <div className="text-center">
                  <Tablet className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Tablet</p>
                </div>
                <div className="text-center">
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Desktop</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Live Website
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AdminGuard>
  )
} 