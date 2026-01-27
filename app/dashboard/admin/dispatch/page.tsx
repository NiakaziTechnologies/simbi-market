"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTab } from "@/components/dashboard/admin/orders-tab"
import { DriversTab } from "@/components/dashboard/admin/drivers-tab"

export default function AdminDispatchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-foreground mb-2">Dispatch</h1>
        <p className="text-muted-foreground font-light">
          Manage orders and drivers for delivery dispatch
        </p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="orders" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Orders
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-accent data-[state=active]:text-white">
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
