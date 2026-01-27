"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Users, Search, Loader2, ChevronLeft, ChevronRight, Mail, Phone, Building2, ShoppingBag, X } from "lucide-react"
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
import { getAdminUsers, type AdminUser } from "@/lib/api/admin-users"
import { formatDistanceToNow, format } from "date-fns"

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  INACTIVE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [sellerCount, setSellerCount] = useState(0)
  const [buyerCount, setBuyerCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [limit] = useState(100)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAdminUsers(page, limit)
      setUsers(data.users)
      setTotalPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
      setSellerCount(data.pagination.sellerCount)
      setBuyerCount(data.pagination.buyerCount)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.companyName?.toLowerCase().includes(query) ||
      user.businessName?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    )
  })

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Users</h1>
            <p className="text-muted-foreground font-light">
              Manage all platform users (buyers, sellers, admins)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-2xl font-light text-foreground">{total}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Sellers</div>
              <div className="text-2xl font-light text-green-400">{sellerCount}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Buyers</div>
              <div className="text-2xl font-light text-purple-400">{buyerCount}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-light flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  {total > 0 ? `${total} total users` : "View, edit, and manage user accounts"}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-9 bg-muted/50 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                <Button onClick={loadUsers} className="mt-4" variant="outline">
                  Retry
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No users found"}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[200px]">User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.01 }}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-white">
                                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {user.name || "No name"}
                                </div>
                                <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.isBuyer && (
                                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 w-fit">
                                  <ShoppingBag className="h-3 w-3 mr-1" />
                                  Buyer
                                </Badge>
                              )}
                              {user.isSeller && (
                                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 w-fit">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Seller
                                </Badge>
                              )}
                              {user.buyerType && (
                                <span className="text-xs text-muted-foreground">
                                  {user.buyerType}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {(user.phone || user.phoneNumber || user.contactNumber) && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {user.phone || user.phoneNumber || user.contactNumber}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              {user.companyName && (
                                <div className="text-foreground">{user.companyName}</div>
                              )}
                              {user.businessName && (
                                <div className="text-foreground">{user.businessName}</div>
                              )}
                              {user.tradingName && (
                                <div className="text-muted-foreground">Trading: {user.tradingName}</div>
                              )}
                              {user.tin && (
                                <div className="text-xs text-muted-foreground">TIN: {user.tin}</div>
                              )}
                              {user.sriScore !== undefined && (
                                <div className="text-xs text-muted-foreground">SRI: {user.sriScore}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.status && (
                              <Badge variant="outline" className={statusColors[user.status] || "bg-muted text-muted-foreground"}>
                                {user.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user._count?.orders !== undefined ? (
                                <span className="font-medium text-foreground">{user._count.orders}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {user.createdAt ? formatTime(user.createdAt) : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Showing page {page} of {totalPages} ({total} total users)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">User Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedUser.name || selectedUser.email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{selectedUser.name || "N/A"}</div>
                      </div>
                      {selectedUser.firstName && (
                        <div>
                          <div className="text-sm text-muted-foreground">First Name</div>
                          <div className="font-medium">{selectedUser.firstName}</div>
                        </div>
                      )}
                      {selectedUser.lastName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Last Name</div>
                          <div className="font-medium">{selectedUser.lastName}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedUser.email}
                        </div>
                      </div>
                      {(selectedUser.phone || selectedUser.phoneNumber || selectedUser.contactNumber) && (
                        <div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                          <div className="font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {selectedUser.phone || selectedUser.phoneNumber || selectedUser.contactNumber}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">User Type</div>
                        <div className="flex gap-2 mt-1">
                          {selectedUser.isBuyer && (
                            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Buyer
                            </Badge>
                          )}
                          {selectedUser.isSeller && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Building2 className="h-3 w-3 mr-1" />
                              Seller
                            </Badge>
                          )}
                          {selectedUser.userType && (
                            <Badge variant="outline">{selectedUser.userType}</Badge>
                          )}
                        </div>
                      </div>
                      {selectedUser.buyerType && (
                        <div>
                          <div className="text-sm text-muted-foreground">Buyer Type</div>
                          <div className="font-medium">{selectedUser.buyerType}</div>
                        </div>
                      )}
                      {selectedUser.status && (
                        <div>
                          <div className="text-sm text-muted-foreground">Status</div>
                          <Badge variant="outline" className={statusColors[selectedUser.status] || "bg-muted text-muted-foreground"}>
                            {selectedUser.status}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Business Information */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedUser.companyName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Company Name</div>
                          <div className="font-medium">{selectedUser.companyName}</div>
                        </div>
                      )}
                      {selectedUser.businessName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Business Name</div>
                          <div className="font-medium">{selectedUser.businessName}</div>
                        </div>
                      )}
                      {selectedUser.tradingName && (
                        <div>
                          <div className="text-sm text-muted-foreground">Trading Name</div>
                          <div className="font-medium">{selectedUser.tradingName}</div>
                        </div>
                      )}
                      {selectedUser.tin && (
                        <div>
                          <div className="text-sm text-muted-foreground">TIN</div>
                          <div className="font-medium">{selectedUser.tin}</div>
                        </div>
                      )}
                      {selectedUser.sriScore !== undefined && (
                        <div>
                          <div className="text-sm text-muted-foreground">SRI Score</div>
                          <div className="font-medium">{selectedUser.sriScore}</div>
                        </div>
                      )}
                      {selectedUser.isEligible !== undefined && (
                        <div>
                          <div className="text-sm text-muted-foreground">Eligible</div>
                          <Badge variant="outline" className={selectedUser.isEligible ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                            {selectedUser.isEligible ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser._count?.orders !== undefined && (
                        <div>
                          <div className="text-sm text-muted-foreground">Total Orders</div>
                          <div className="text-2xl font-light text-foreground">{selectedUser._count.orders}</div>
                        </div>
                      )}
                      {selectedUser._count?.addresses !== undefined && (
                        <div>
                          <div className="text-sm text-muted-foreground">Saved Addresses</div>
                          <div className="text-2xl font-light text-foreground">{selectedUser._count.addresses}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedUser.createdAt && (
                      <div>
                        <div className="text-sm text-muted-foreground">Joined</div>
                        <div className="font-medium">
                          {format(new Date(selectedUser.createdAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedUser.createdAt)}
                        </div>
                      </div>
                    )}
                    {selectedUser.updatedAt && (
                      <div>
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">
                          {format(new Date(selectedUser.updatedAt), "PPpp")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(selectedUser.updatedAt)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
