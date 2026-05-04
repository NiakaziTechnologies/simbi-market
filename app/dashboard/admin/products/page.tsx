"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ClipboardList } from "lucide-react"
import { SellerProductsTab } from "@/components/dashboard/admin/seller-products-tab"
import { MasterProductsTab } from "@/components/dashboard/admin/master-products-tab"
import { AdminCustomProductRequestsTab } from "@/components/dashboard/admin/custom-product-requests-tab"

function AdminProductsPageInner() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("seller-products")

  useEffect(() => {
    const t = searchParams.get("tab")
    if (t === "custom-requests") {
      setActiveTab("custom-requests")
    }
  }, [searchParams])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-light text-foreground mb-2">Products</h1>
        <p className="text-muted-foreground font-light">
          Manage and moderate product listings across the platform
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-3 bg-background/50 border border-border gap-1 p-1">
          <TabsTrigger
            value="seller-products"
            className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "seller-products" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            <Package className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Seller Products</span>
            <span className="sm:hidden">Sellers</span>
          </TabsTrigger>
          <TabsTrigger
            value="master-products"
            className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "master-products" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            <Package className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Master Products</span>
            <span className="sm:hidden">Master</span>
          </TabsTrigger>
          <TabsTrigger
            value="custom-requests"
            className="text-xs sm:text-sm text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "custom-requests" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            <ClipboardList className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Custom requests</span>
            <span className="sm:hidden">Custom</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seller-products" className="mt-6">
          <SellerProductsTab />
        </TabsContent>

        <TabsContent value="master-products" className="mt-6">
          <MasterProductsTab />
        </TabsContent>

        <TabsContent value="custom-requests" className="mt-6">
          <AdminCustomProductRequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
        </div>
      }
    >
      <AdminProductsPageInner />
    </Suspense>
  )
}
