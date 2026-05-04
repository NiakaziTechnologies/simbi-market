"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit3, Trash2, Banknote, DollarSign } from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const initialBanks = [
  {
    id: "zb",
    name: "ZB Bank",
    logo: "https://www.zb.co.zw/sites/default/files/zblogo.png",
    interestRate: 12.5,
    minAmount: 500,
    maxAmount: 50000,
    status: "active" as "active" | "inactive",
  },
  {
    id: "cbz",
    name: "CBZ Bank",
    logo: "https://scontent-jnb2-1.xx.fbcdn.net/v/t39.30808-1/348247466_236891238982731_2244404912065337579_n.jpg?...",
    interestRate: 11.8,
    minAmount: 1000,
    maxAmount: 75000,
    status: "active",
  },
  {
    id: "cabs",
    name: "CABS",
    logo: "http://www.cabs.co.zw/sites/default/files/logo.png",
    interestRate: 13.2,
    minAmount: 250,
    maxAmount: 30000,
    status: "inactive",
  },
]

const initialPlatformSettings = {
  shippingPrice: 15.0,
  platformTaxFee: 2.5,
  minOrderValue: 50.0,
}

export function FinanceConfigurationTab() {
  const [banks, setBanks] = useState(initialBanks)
  const [platformSettings, setPlatformSettings] = useState(initialPlatformSettings)
  const [editingBank, setEditingBank] = useState<(typeof initialBanks)[0] | null>(null)
  const [newBank, setNewBank] = useState({
    name: "",
    logo: "",
    interestRate: "",
    minAmount: "",
    maxAmount: "",
    status: "active" as "active" | "inactive",
  })
  const [newShipping, setNewShipping] = useState(platformSettings.shippingPrice.toString())
  const [newTaxFee, setNewTaxFee] = useState(platformSettings.platformTaxFee.toString())
  const [newMinOrder, setNewMinOrder] = useState(platformSettings.minOrderValue.toString())

  const addBank = () => {
    const bankId = `bank-${Date.now()}`
    const newBankData = {
      ...newBank,
      id: bankId,
      interestRate: parseFloat(String(newBank.interestRate)) || 0,
      minAmount: parseFloat(String(newBank.minAmount)) || 0,
      maxAmount: parseFloat(String(newBank.maxAmount)) || 0,
    }
    setBanks([...banks, newBankData])
    setNewBank({ name: "", logo: "", interestRate: "", minAmount: "", maxAmount: "", status: "active" })
    toast.success("Bank added successfully!")
  }

  const updateBank = (id: string) => {
    if (!editingBank) return
    setBanks(banks.map((bank) => (bank.id === id ? { ...editingBank } : bank)))
    setEditingBank(null)
    toast.success("Bank updated successfully!")
  }

  const deleteBank = (id: string) => {
    setBanks(banks.filter((bank) => bank.id !== id))
    toast.success("Bank deleted successfully!")
  }

  const savePlatformSettings = () => {
    setPlatformSettings({
      shippingPrice: parseFloat(newShipping),
      platformTaxFee: parseFloat(newTaxFee),
      minOrderValue: parseFloat(newMinOrder),
    })
    toast.success("Platform settings updated!")
  }

  const editBank = (bank: (typeof initialBanks)[0]) => {
    setEditingBank(bank)
    setNewBank({
      ...bank,
      interestRate: String(bank.interestRate),
      minAmount: String(bank.minAmount),
      maxAmount: String(bank.maxAmount),
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="glass-card border-accent/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Banknote className="h-6 w-6 text-accent" />
            <div>
              <CardTitle className="text-2xl">Loan Banks</CardTitle>
              <CardDescription>Manage banks shown in seller/buyer loan applications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-gradient-to-r from-accent/5 border-accent/30">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={newBank.name}
                    onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                    placeholder="e.g. ZB Bank"
                  />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={newBank.logo}
                    onChange={(e) => setNewBank({ ...newBank, logo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newBank.interestRate}
                    onChange={(e) => setNewBank({ ...newBank, interestRate: e.target.value })}
                    placeholder="12.5"
                  />
                </div>
                <div>
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    value={newBank.minAmount}
                    onChange={(e) => setNewBank({ ...newBank, minAmount: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    value={newBank.maxAmount}
                    onChange={(e) => setNewBank({ ...newBank, maxAmount: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={newBank.status === "active" ? "default" : "outline"}
                      onClick={() => setNewBank({ ...newBank, status: "active" })}
                      className="flex-1"
                    >
                      Active
                    </Button>
                    <Button
                      variant={newBank.status === "inactive" ? "default" : "outline"}
                      onClick={() => setNewBank({ ...newBank, status: "inactive" })}
                      className="flex-1 bg-destructive/10 hover:bg-destructive/20"
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                {editingBank ? (
                  <>
                    <Button onClick={() => updateBank(editingBank.id)} className="flex-1">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Update Bank
                    </Button>
                    <Button variant="outline" onClick={() => setEditingBank(null)} className="flex-1">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={addBank} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Active Banks ({banks.filter((b) => b.status === "active").length})</h3>
              <Badge variant="outline" className="text-sm">
                Auto-syncs to seller/buyer dashboards
              </Badge>
            </div>
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Logo</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.map((bank) => (
                    <TableRow key={bank.id} className="border-b border-border/50 hover:bg-accent/5">
                      <TableCell>
                        <img src={bank.logo} alt={bank.name} className="w-10 h-8 object-contain rounded" />
                      </TableCell>
                      <TableCell className="font-medium">{bank.name}</TableCell>
                      <TableCell className="font-mono">{bank.interestRate}%</TableCell>
                      <TableCell className="font-mono text-sm">
                        ${bank.minAmount.toLocaleString()} - ${bank.maxAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={bank.status === "active" ? "default" : "secondary"}>{bank.status.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => editBank(bank)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteBank(bank.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-accent/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-accent" />
            <div>
              <CardTitle className="text-2xl">Platform Fees & Shipping</CardTitle>
              <CardDescription>Configure global shipping price and platform tax fee</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Platform Settings
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Shipping Price (per order)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={newShipping}
                      onChange={(e) => setNewShipping(e.target.value)}
                      className="pl-10"
                      placeholder="15.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Applied to all orders automatically</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Platform Tax Fee (%)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">%</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={newTaxFee}
                      onChange={(e) => setNewTaxFee(e.target.value)}
                      className="pl-8"
                      placeholder="2.5"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Commission on all seller transactions</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2 block">Minimum Order Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={newMinOrder}
                      onChange={(e) => setNewMinOrder(e.target.value)}
                      className="pl-10"
                      placeholder="50.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Orders below this value are not allowed</p>
                </div>
              </div>
              <Button onClick={savePlatformSettings} className="mt-6 w-full">
                Save Platform Settings
              </Button>
              <div className="mt-4 p-4 bg-muted/30 rounded-xl text-sm">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Current Live Values
                </h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="font-mono font-semibold">${platformSettings.shippingPrice}</div>
                    <div className="text-muted-foreground">Shipping</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold">{platformSettings.platformTaxFee}%</div>
                    <div className="text-muted-foreground">Tax Fee</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold">${platformSettings.minOrderValue}</div>
                    <div className="text-muted-foreground">Min Order</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
