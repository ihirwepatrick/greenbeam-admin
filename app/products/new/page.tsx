"use client"

import { useState, useRef, useEffect } from "react"
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
  Plus,
  X,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { productService } from "@/lib/services/api"
import { sidebarLinks } from "@/lib/admin-links"
import AdminGuard from "@/components/AdminGuard"

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "/"

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    status: "AVAILABLE",
    images: 0,
    features: [""],
    specifications: ""
  })
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const thumbInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories()
        if (response.success) {
          setCategories(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      status: "AVAILABLE",
      images: 0,
      features: [""],
      specifications: "",
    })
    setSelectedFiles([])
    setThumbnail(null)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.description || !thumbnail) return
    setIsSaving(true)
    try {
      const nonEmptyFeatures = formData.features.map(f => f.trim()).filter(Boolean)
      let specs: any = undefined
      if (formData.specifications && formData.specifications.trim()) {
        try { specs = JSON.parse(formData.specifications) } catch { specs = formData.specifications }
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        image: thumbnail,
      }

      // Only add optional fields if they have valid values
      if (nonEmptyFeatures.length > 0) {
        payload.features = nonEmptyFeatures
      }
      if (specs && specs.trim()) {
        payload.specifications = specs
      }
      if (selectedFiles.length > 0) {
        payload.images = selectedFiles
      }

      console.log("Sending payload:", payload)
      const res = await productService.createProduct(payload as any)
      if (res.success) {
        setShowSuccess(true)
      } else {
        console.error("Create product failed", res)
      }
    } catch (e) {
      console.error("Create product error:", e)
      // Log more details about the error
      if (e instanceof Error) {
        console.error("Error message:", e.message)
        console.error("Error stack:", e.stack)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }
  const openThumbPicker = () => {
    thumbInputRef.current?.click()
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    const combined = [...selectedFiles, ...files].slice(0, 3)
    setSelectedFiles(combined)
    updateFormData("images", combined.length)
  }

  const handleThumbSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setThumbnail(file)
  }

  const removeSelectedFile = (index: number) => {
    const next = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(next)
    updateFormData("images", next.length)
  }

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()])
      setFormData(prev => ({ ...prev, category: newCategory.trim() }))
      setNewCategory("")
      setShowNewCategoryInput(false)
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
                    link.href === "/products" 
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-600">Add a new product to be displayed on the website</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <div className="mt-1 space-y-2">
                      <select
                        id="category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.category}
                        onChange={(e) => updateFormData("category", e.target.value)}
                        disabled={isLoadingCategories}
                      >
                        <option value="">{isLoadingCategories ? "Loading categories..." : "Select Category"}</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      
                      {!showNewCategoryInput ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Category
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter new category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddNewCategory}
                            disabled={!newCategory.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowNewCategoryInput(false)
                              setNewCategory("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Product Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the product features, specifications, and benefits..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Status and Specs */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                      value={formData.status}
                      onChange={(e) => updateFormData("status", e.target.value)}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                      <option value="DISCONTINUED">DISCONTINUED</option>
                      <option value="PRE_ORDER">PRE_ORDER</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="specs">Specifications (JSON)</Label>
                    <Textarea
                      id="specs"
                      rows={4}
                      placeholder='e.g. {"power": "400W", "efficiency": "21.5%"}'
                      value={formData.specifications}
                      onChange={(e) => updateFormData("specifications", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Key Features</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeature}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Feature ${index + 1}`}
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                        />
                        {formData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <Label>Product Images</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload product images</p>
                    <p className="text-sm text-gray-500 mb-4">Thumbnail under image, gallery under images (max 3)</p>

                    {/* Thumbnail */}
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbSelected}
                    />
                    <div className="mb-4">
                      <Button type="button" variant="outline" onClick={openThumbPicker}>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Thumbnail (image)
                      </Button>
                      {thumbnail && (
                        <p className="mt-2 text-sm text-gray-600 truncate" title={thumbnail.name}>Selected: {thumbnail.name}</p>
                      )}
                    </div>

                    {/* Gallery */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFilesSelected}
                    />

                    <Button type="button" variant="outline" onClick={openFilePicker}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Gallery Files (images)
                    </Button>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="border rounded p-2 text-left">
                              <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                              <p className="text-[10px] text-gray-500">{Math.round(file.size / 1024)} KB</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => removeSelectedFile(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || !formData.name || !formData.category || !formData.description || !thumbnail}
                    className="bg-[#0a6650] hover:bg-[#084c3d]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Creating..." : "Create Product"}
                  </Button>
                  <Link href="/products">
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Product Created
            </DialogTitle>
            <DialogDescription>
              Your product has been uploaded successfully. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2">
            <Button
              className="bg-[#0a6650] hover:bg-[#084c3d]"
              onClick={() => { window.location.href = "/products" }}
            >
              Go to Products
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowSuccess(false); resetForm(); }}
            >
              Create Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminGuard>
  )
}
