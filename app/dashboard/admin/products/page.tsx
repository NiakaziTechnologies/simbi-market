"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package } from "lucide-react"
import { SellerProductsTab } from "@/components/dashboard/admin/seller-products-tab"
import { MasterProductsTab } from "@/components/dashboard/admin/master-products-tab"

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("seller-products")

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border">
          <TabsTrigger value="seller-products" className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground">
            <Package className="h-4 w-4 mr-2" />
            Seller Products
          </TabsTrigger>
          <TabsTrigger value="master-products" className="data-[state=active]:bg-accent data-[state=active]:text-white text-foreground">
            <Package className="h-4 w-4 mr-2" />
            Master Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seller-products" className="mt-6">
          <SellerProductsTab />
        </TabsContent>

        <TabsContent value="master-products" className="mt-6">
          <MasterProductsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
