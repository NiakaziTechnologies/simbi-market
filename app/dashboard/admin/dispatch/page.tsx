"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTab } from "@/components/dashboard/admin/orders-tab"
import { DriversTab } from "@/components/dashboard/admin/drivers-tab"

export default function AdminDispatchPage() {
  const [activeTab, setActiveTab] = useState("orders")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-foreground mb-2">Dispatch</h1>
        <p className="text-muted-foreground font-light">
          Manage orders and drivers for delivery dispatch
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border">
          <TabsTrigger
            value="orders"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "orders" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="drivers"
            className="text-foreground hover:bg-blue-500 transition-all duration-200 ease-in-out"
            style={activeTab === "drivers" ? { backgroundColor: "#2563eb", color: "white" } : {}}
          >
            Drivers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="drivers">
          <DriversTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
