"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Truck, Phone, Mail, Car, FileText, Calendar, ShoppingBag, Plus, Loader2 } from "lucide-react"
import { getAdminDrivers, createDriver, type AdminDriver } from "@/lib/api/admin-drivers"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, format } from "date-fns"

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-500/20 text-green-400 border-green-500/30",
  UNAVAILABLE: "bg-red-500/20 text-red-400 border-red-500/30",
  ON_DELIVERY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  OFFLINE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

export function DriversTab() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDriver, setSelectedDriver] = useState<AdminDriver | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    licenseNumber: "",
    vehicleType: "",
    vehiclePlate: "",
    notes: ""
  })
  const { toast } = useToast()

  const loadDrivers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAdminDrivers()
      setDrivers(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      driver.firstName?.toLowerCase().includes(query) ||
      driver.lastName?.toLowerCase().includes(query) ||
      driver.phoneNumber?.toLowerCase().includes(query) ||
      driver.email?.toLowerCase().includes(query) ||
      driver.vehiclePlate?.toLowerCase().includes(query) ||
      driver.licenseNumber?.toLowerCase().includes(query)
    )
  })

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  const handleCreateDriver = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.phoneNumber) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and phone number are required",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      const request: any = {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        phoneNumber: createForm.phoneNumber
      }

      if (createForm.email) request.email = createForm.email
      if (createForm.licenseNumber) request.licenseNumber = createForm.licenseNumber
      if (createForm.vehicleType) request.vehicleType = createForm.vehicleType
      if (createForm.vehiclePlate) request.vehiclePlate = createForm.vehiclePlate
      if (createForm.notes) request.notes = createForm.notes

      await createDriver(request)
      
      toast({
        title: "Success",
        description: "Driver created successfully",
      })

      // Close modal, reset form, and refresh
      setShowCreateModal(false)
      setCreateForm({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        licenseNumber: "",
        vehicleType: "",
        vehiclePlate: "",
        notes: ""
      })
      loadDrivers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create driver",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Card className="glass-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Drivers
              </CardTitle>
              <CardDescription>
                {drivers.length > 0 ? `${drivers.length} total drivers` : "View and manage all drivers"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search drivers..."
                  className="pl-9 bg-muted/50 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Driver
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadDrivers} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No drivers found matching your search" : "No drivers found"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Driver</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver, index) => (
                      <TableRow
                        key={driver.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-white">
                                {driver.firstName?.charAt(0).toUpperCase() || 'D'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground">
                                {driver.firstName} {driver.lastName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {driver.phoneNumber}
                            </div>
                            {driver.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {driver.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {driver.vehicleType ? (
                              <>
                                <div className="font-medium text-foreground">{driver.vehicleType}</div>
                                {driver.vehiclePlate && (
                                  <div className="text-muted-foreground">{driver.vehiclePlate}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {driver.licenseNumber ? (
                              <span className="font-medium text-foreground">{driver.licenseNumber}</span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[driver.status] || "bg-muted text-muted-foreground"}>
                            {driver.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {driver._count?.orders !== undefined ? (
                              <span className="font-medium text-foreground">{driver._count.orders}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(driver.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedDriver(driver)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={(open) => !open && setSelectedDriver(null)}>
        <DialogContent className="!max-w-[75vw] !w-[75vw] max-h-[90vh] overflow-y-auto">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Driver Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedDriver.firstName} {selectedDriver.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{selectedDriver.firstName} {selectedDriver.lastName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </div>
                        <div className="font-medium">{selectedDriver.phoneNumber}</div>
                      </div>
                      {selectedDriver.email && (
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                          <div className="font-medium">{selectedDriver.email}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant="outline" className={statusColors[selectedDriver.status] || "bg-muted text-muted-foreground"}>
                          {selectedDriver.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedDriver.vehicleType ? (
                        <>
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              Vehicle Type
                            </div>
                            <div className="font-medium">{selectedDriver.vehicleType}</div>
                          </div>
                          {selectedDriver.vehiclePlate && (
                            <div>
                              <div className="text-sm text-muted-foreground">Vehicle Plate</div>
                              <div className="font-medium">{selectedDriver.vehiclePlate}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">No vehicle information available</div>
                      )}
                      {selectedDriver.licenseNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            License Number
                          </div>
                          <div className="font-medium">{selectedDriver.licenseNumber}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Total Orders
                          </div>
                          <div className="text-2xl font-light text-foreground mt-1">
                            {selectedDriver._count?.orders || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Created
                        </div>
                        <div className="font-medium">
                          {format(new Date(selectedDriver.createdAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedDriver.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">
                          {format(new Date(selectedDriver.updatedAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedDriver.updatedAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                {selectedDriver.notes && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm p-3 bg-muted/50 rounded-lg">{selectedDriver.notes}</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Driver Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Driver</DialogTitle>
            <DialogDescription>
              Add a new driver to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+263771234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="driver@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={createForm.licenseNumber}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="DL123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  value={createForm.vehicleType}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                  placeholder="Van, Truck, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
              <Input
                id="vehiclePlate"
                value={createForm.vehiclePlate}
                onChange={(e) => setCreateForm(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                placeholder="ABC1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={createForm.notes}
                onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the driver..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                    email: "",
                    licenseNumber: "",
                    vehicleType: "",
                    vehiclePlate: "",
                    notes: ""
                  })
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDriver}
                disabled={isCreating || !createForm.firstName || !createForm.lastName || !createForm.phoneNumber}
                className="bg-accent hover:bg-accent/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Driver
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
