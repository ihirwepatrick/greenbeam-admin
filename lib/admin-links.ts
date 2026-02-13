import { Home, Package, Users, Eye, Settings, ShoppingCart, CreditCard, DollarSign } from "lucide-react"

export const sidebarLinks = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Enquiries", href: "/enquiries", icon: Users },
  { name: "Website", href: "/website", icon: Eye },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Carts", href: "/carts", icon: ShoppingCart },
  { name: "Orders", href: "/orders", icon: CreditCard },
  { name: "Payments", href: "/payments", icon: DollarSign },
] as const

export function getMainSiteUrl(): string {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_MAIN_SITE_URL as string) || "/"
  }
  return (process.env.NEXT_PUBLIC_MAIN_SITE_URL as string) || "/"
}
