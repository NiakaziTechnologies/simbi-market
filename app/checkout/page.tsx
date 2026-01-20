"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuth } from "@/lib/auth/auth-context"
import { createOrderFromCart, type CreateOrderResponse } from "@/lib/api/orders"
import { getAddresses, createAddress, type Address } from "@/lib/api/addresses"
import { Navigation } from "@/components/navigation"
import { Trash2, Minus, Plus, Lock, CreditCard, Truck, Shield, ChevronRight, ShoppingBag, Loader2, MapPin, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, total } = useSelector((state: RootState) => state.cart)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { loadCart, updateQuantity, removeFromCart, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"paynow" | "paypal" | "cash">("paynow")
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  
  // Addresses state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  
  // Shipping address form state (for new address)
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Zimbabwe",
    isDefault: false,
  })
  
  // Order details form state
  const [orderDetails, setOrderDetails] = useState({
    poNumber: "",
    costCenter: "",
    notes: "",
    couponCode: "",
  })

  // Load cart and addresses from API on mount and when auth status changes
  useEffect(() => {
    console.log('Checkout page: Auth status - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading)
    
    // Only load cart after auth has finished loading
    if (!authLoading) {
      if (isAuthenticated) {
        console.log('Checkout page: User authenticated, loading cart and addresses...')
        loadCart().catch((error) => {
          console.error('Checkout page: Error loading cart:', error)
        })
        
        // Load saved addresses
        setIsLoadingAddresses(true)
        getAddresses()
          .then((addresses) => {
            setSavedAddresses(addresses)
            // Select default address if available
            const defaultAddress = addresses.find(addr => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
            } else if (addresses.length > 0) {
              setSelectedAddressId(addresses[0].id)
            }
          })
          .catch((error) => {
            console.error('Checkout page: Error loading addresses:', error)
          })
          .finally(() => {
            setIsLoadingAddresses(false)
          })
      } else {
        console.log('Checkout page: User not authenticated, redirecting to login...')
        window.location.href = '/auth/login?returnUrl=' + encodeURIComponent('/checkout')
      }
    }
  }, [isAuthenticated, authLoading, loadCart])

  const shipping = total > 500 ? 0 : 49.99
  const tax = total * 0.0825
  const grandTotal = total + shipping + tax

  const handleQuantityChange = async (item: typeof items[0], change: number) => {
    if (!item.cartItemId || updatingItems.has(item.cartItemId)) {
      return
    }

    const newQuantity = Math.max(1, item.quantity + change)
    setUpdatingItems((prev) => new Set(prev).add(item.cartItemId!))
    
    try {
      await updateQuantity(item.cartItemId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev)
        next.delete(item.cartItemId!)
        return next
      })
    }
  }

  const handleRemoveItem = async (item: typeof items[0]) => {
    if (!item.cartItemId || removingItems.has(item.cartItemId)) {
      return
    }

    setRemovingItems((prev) => new Set(prev).add(item.cartItemId!))
    
    try {
      await removeFromCart(item.cartItemId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(item.cartItemId!)
        return next
      })
    }
  }

  const handleSaveNewAddress = async () => {
    if (!shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province) {
      alert('Please fill in all required fields for the new address.')
      return
    }
    
    setIsLoadingAddresses(true)
    try {
      const newAddress = await createAddress(shippingForm)
      setSavedAddresses(prev => [...prev, newAddress])
      setSelectedAddressId(newAddress.id)
      setShowNewAddressForm(false)
      setShippingForm({
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Zimbabwe",
        isDefault: false,
      })
    } catch (error: any) {
      console.error('Error saving address:', error)
      alert(error.message || 'Failed to save new address. Please try again.')
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return
    
    setIsPlacingOrder(true)
    try {
      // Prepare order request
      const orderRequest: any = {}
      
      // Add shipping address ID if using saved address, otherwise add new address object
      if (selectedAddressId && !showNewAddressForm) {
        orderRequest.shippingAddressId = selectedAddressId
      } else if (showNewAddressForm && shippingForm.addressLine1 && shippingForm.city && shippingForm.province) {
        orderRequest.shippingAddress = {
          fullName: shippingForm.fullName || undefined,
          phoneNumber: shippingForm.phoneNumber || undefined,
          addressLine1: shippingForm.addressLine1,
          addressLine2: shippingForm.addressLine2 || undefined,
          city: shippingForm.city,
          province: shippingForm.province,
          postalCode: shippingForm.postalCode || undefined,
          country: shippingForm.country || undefined,
          isDefault: shippingForm.isDefault,
        }
      } else {
        alert('Please select a shipping address or add a new one.')
        setIsPlacingOrder(false)
        return
      }
      
      // Add optional fields if provided
      if (orderDetails.poNumber) orderRequest.poNumber = orderDetails.poNumber
      if (orderDetails.costCenter) orderRequest.costCenter = orderDetails.costCenter
      if (orderDetails.notes) orderRequest.notes = orderDetails.notes
      if (orderDetails.couponCode) orderRequest.couponCode = orderDetails.couponCode
      
      // Create order from cart
      const response = await createOrderFromCart(orderRequest)
      
      // Store order data and clear cart
      setOrderData(response)
      await clearCart()
      setOrderComplete(true)
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert(error.message || 'Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-lg p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Shield className="h-10 w-10 text-green-400" />
                </motion.div>
              </div>
              <h1 className="text-4xl font-light text-white mb-4">Order Confirmed</h1>
              <p className="text-muted font-light mb-2">Thank you for your purchase</p>
              <p className="text-sm text-muted font-light mb-8">
                Order #ORD-2025-0143 • Confirmation sent to your email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/buyer/orders">
                  <Button className="w-full sm:w-auto">View Order</Button>
                </Link>
                <Link href="/catalog">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-lg p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted" />
              </div>
              <h1 className="text-3xl font-light text-white mb-4">Your cart is empty</h1>
              <p className="text-muted font-light mb-8">Add some premium parts to get started</p>
              <Link href="/catalog">
                <Button>Browse Catalog</Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-4">
              Secure <span className="font-semibold">Checkout</span>
            </h1>
            <p className="text-muted font-light">Complete your order with confidence</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center mb-12"
          >
            {["Cart", "Shipping", "Payment"].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <button
                  onClick={() => setStep(index + 1)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    step === index + 1
                      ? "bg-white text-black"
                      : step > index + 1
                        ? "bg-accent/20 text-accent"
                        : "bg-white/5 text-muted"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      step === index + 1 ? "bg-black text-white" : step > index + 1 ? "bg-accent text-white" : ""
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-light hidden sm:inline">{stepName}</span>
                </button>
                {index < 2 && <ChevronRight className="h-5 w-5 text-muted mx-2" />}
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Cart Review */}
                {step === 1 && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-light text-white mb-6">Review Your Items</h2>
                    {items.map((item) => (
                      <div key={item.id} className="glass-card rounded-lg p-6">
                        <div className="flex gap-6">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-light text-white">{item.name}</h3>
                                <p className="text-muted font-light text-sm">{item.category}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item)}
                                className="text-muted hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!item.cartItemId || removingItems.has(item.cartItemId)}
                              >
                                {removingItems.has(item.cartItemId) ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleQuantityChange(item, -1)}
                                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!item.cartItemId || updatingItems.has(item.cartItemId) || item.quantity <= 1}
                                >
                                  {updatingItems.has(item.cartItemId) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Minus className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="text-white font-light w-8 text-center">
                                  {updatingItems.has(item.cartItemId) ? (
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item, 1)}
                                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!item.cartItemId || updatingItems.has(item.cartItemId)}
                                >
                                  {updatingItems.has(item.cartItemId) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              <span className="text-xl font-light text-white">
                                ${(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => setStep(2)} className="w-full mt-6" size="lg">
                      Continue to Shipping
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Shipping */}
                {step === 2 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="text-2xl font-light text-white mb-6">Shipping Information</h2>
                    
                    {/* Saved Addresses */}
                    {!showNewAddressForm && (
                      <div className="space-y-4 mb-6">
                        {isLoadingAddresses ? (
                          <div className="glass-card rounded-lg p-6 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-accent" />
                            <p className="text-muted text-sm">Loading addresses...</p>
                          </div>
                        ) : savedAddresses.length > 0 ? (
                          <>
                            <h3 className="text-lg font-light text-white mb-4">Select Shipping Address</h3>
                            <div className="space-y-3">
                              {savedAddresses.map((address) => (
                                <label
                                  key={address.id}
                                  className={`block glass-card rounded-lg p-4 cursor-pointer border-2 transition-all ${
                                    selectedAddressId === address.id
                                      ? 'border-accent bg-accent/10'
                                      : 'border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <input
                                      type="radio"
                                      name="address"
                                      checked={selectedAddressId === address.id}
                                      onChange={() => setSelectedAddressId(address.id)}
                                      className="mt-1 accent-accent"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-accent" />
                                        <span className="text-white font-light">{address.fullName}</span>
                                        {address.isDefault && (
                                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Default</span>
                                        )}
                                      </div>
                                      <p className="text-muted text-sm">{address.phoneNumber}</p>
                                      <p className="text-muted text-sm mt-1">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                      </p>
                                      <p className="text-muted text-sm">
                                        {address.city}, {address.province}
                                        {address.postalCode && ` ${address.postalCode}`}
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </>
                        ) : null}
                        
                        {/* Add New Address Button */}
                        <Button
                          variant="outline"
                          onClick={() => setShowNewAddressForm(true)}
                          className="w-full bg-transparent border-white/20 hover:bg-white/5"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      </div>
                    )}
                    
                    {/* New Address Form */}
                    {showNewAddressForm && (
                      <div className="glass-card rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-light text-white">New Shipping Address</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowNewAddressForm(false)
                              setShippingForm({
                                fullName: "",
                                phoneNumber: "",
                                addressLine1: "",
                                addressLine2: "",
                                city: "",
                                province: "",
                                postalCode: "",
                                country: "Zimbabwe",
                                isDefault: false,
                              })
                            }}
                            className="text-muted hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted font-light mb-2 block">Full Name</label>
                            <Input 
                              placeholder="John Doe" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.fullName}
                              onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted font-light mb-2 block">Phone Number</label>
                            <Input 
                              placeholder="+263771234567" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.phoneNumber}
                              onChange={(e) => setShippingForm({ ...shippingForm, phoneNumber: e.target.value })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted font-light mb-2 block">Address Line 1 <span className="text-destructive">*</span></label>
                            <Input 
                              placeholder="123 Main Street" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.addressLine1}
                              onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted font-light mb-2 block">Address Line 2 (Optional)</label>
                            <Input 
                              placeholder="Apartment 5B, Suite 100" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.addressLine2}
                              onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted font-light mb-2 block">City <span className="text-destructive">*</span></label>
                            <Input 
                              placeholder="Harare" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.city}
                              onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted font-light mb-2 block">Province/State <span className="text-destructive">*</span></label>
                            <Input 
                              placeholder="Harare" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.province}
                              onChange={(e) => setShippingForm({ ...shippingForm, province: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted font-light mb-2 block">Postal Code</label>
                            <Input 
                              placeholder="00263" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.postalCode}
                              onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted font-light mb-2 block">Country</label>
                            <Input 
                              placeholder="Zimbabwe" 
                              className="bg-white/5 border-white/10 text-white"
                              value={shippingForm.country}
                              onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={shippingForm.isDefault}
                                onChange={(e) => setShippingForm({ ...shippingForm, isDefault: e.target.checked })}
                                className="accent-accent"
                              />
                              <span className="text-sm text-muted font-light">Set as default address</span>
                            </label>
                          </div>
                        </div>
                        <Button
                          onClick={handleSaveNewAddress}
                          className="w-full mt-4"
                          disabled={isLoadingAddresses || !shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province}
                        >
                          {isLoadingAddresses ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Address'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Order Details Section */}
                    <div className="glass-card rounded-lg p-6">
                      <h3 className="text-lg font-light text-white mb-4">Order Details (Optional)</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted font-light mb-2 block">PO Number</label>
                          <Input 
                            placeholder="PO-2024-001" 
                            className="bg-white/5 border-white/10 text-white"
                            value={orderDetails.poNumber}
                            onChange={(e) => setOrderDetails({ ...orderDetails, poNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted font-light mb-2 block">Cost Center</label>
                          <Input 
                            placeholder="ENGINEERING" 
                            className="bg-white/5 border-white/10 text-white"
                            value={orderDetails.costCenter}
                            onChange={(e) => setOrderDetails({ ...orderDetails, costCenter: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted font-light mb-2 block">Coupon Code</label>
                          <Input 
                            placeholder="DISCOUNT10" 
                            className="bg-white/5 border-white/10 text-white"
                            value={orderDetails.couponCode}
                            onChange={(e) => setOrderDetails({ ...orderDetails, couponCode: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted font-light mb-2 block">Order Notes</label>
                          <textarea
                            placeholder="Special delivery instructions or notes..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
                            value={orderDetails.notes}
                            onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                        Back
                      </Button>
                      <Button 
                        onClick={() => setStep(3)} 
                        className="flex-1"
                        disabled={!selectedAddressId && !showNewAddressForm}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2 className="text-2xl font-light text-white mb-6">Payment Details</h2>
                    <div className="glass-card rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Lock className="h-4 w-4 text-accent" />
                        <span className="text-sm text-muted font-light">Secure 256-bit SSL encryption</span>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="mb-6">
                        <label className="text-sm text-muted font-light mb-3 block">Payment Method</label>
                        <div className="grid grid-cols-3 gap-4">
                          <button
                            onClick={() => setPaymentMethod("paynow")}
                            className={`p-4 rounded-lg border transition-all ${
                              paymentMethod === "paynow"
                                ? "border-accent bg-accent/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <CreditCard className="h-6 w-6 mx-auto mb-2 text-white" />
                            <p className="text-white font-light text-sm">Pay Now</p>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("paypal")}
                            className={`p-4 rounded-lg border transition-all ${
                              paymentMethod === "paypal"
                                ? "border-accent bg-accent/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-white font-bold text-xs">PP</span>
                            </div>
                            <p className="text-white font-light text-sm">PayPal</p>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("cash")}
                            className={`p-4 rounded-lg border transition-all ${
                              paymentMethod === "cash"
                                ? "border-accent bg-accent/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <Truck className="h-6 w-6 mx-auto mb-2 text-white" />
                            <p className="text-white font-light text-sm">Cash on Delivery</p>
                          </button>
                        </div>
                      </div>

                      {/* Payment Method Info */}
                      {paymentMethod === "paynow" && (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="text-white font-light mb-2">Pay Now</h3>
                              <p className="text-muted font-light text-sm leading-relaxed">
                                You will be redirected to the payment gateway to complete your payment securely.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "paypal" && (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-accent font-bold">PP</span>
                            </div>
                            <div>
                              <h3 className="text-white font-light mb-2">PayPal</h3>
                              <p className="text-muted font-light text-sm leading-relaxed">
                                You will be redirected to PayPal to complete your payment.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "cash" && (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <Truck className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="text-white font-light mb-2">Cash on Delivery</h3>
                              <p className="text-muted font-light text-sm leading-relaxed">
                                Pay with cash when your order is delivered to your doorstep. Our delivery partner will
                                collect the payment upon delivery.
                              </p>
                              <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                                <p className="text-accent font-light text-sm">
                                  Please have exact amount ready: ${grandTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 bg-transparent">
                        Back
                      </Button>
                      <Button 
                        onClick={handlePlaceOrder} 
                        className="flex-1 bg-accent hover:bg-accent/90"
                        disabled={isPlacingOrder || (!selectedAddressId && !showNewAddressForm) || (showNewAddressForm && (!shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province))}
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Place Order • ${grandTotal.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary & Preview */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6 sticky top-32"
              >
                {/* Order Preview */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-light text-white mb-6">Order Preview</h2>
                  
                  {/* Selected Address */}
                  {step >= 2 && (
                    <div className="mb-6">
                      <h3 className="text-sm text-muted font-light mb-3">Shipping Address</h3>
                      {selectedAddressId && !showNewAddressForm ? (
                        (() => {
                          const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId)
                          return selectedAddress ? (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-start gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-accent mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-white font-light text-sm">{selectedAddress.fullName}</p>
                                  <p className="text-muted text-xs">{selectedAddress.phoneNumber}</p>
                                  <p className="text-muted text-xs mt-1">
                                    {selectedAddress.addressLine1}
                                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                                  </p>
                                  <p className="text-muted text-xs">
                                    {selectedAddress.city}, {selectedAddress.province}
                                    {selectedAddress.postalCode && ` ${selectedAddress.postalCode}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null
                        })()
                      ) : showNewAddressForm && shippingForm.addressLine1 ? (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-accent mt-0.5" />
                            <div className="flex-1">
                              {shippingForm.fullName && <p className="text-white font-light text-sm">{shippingForm.fullName}</p>}
                              {shippingForm.phoneNumber && <p className="text-muted text-xs">{shippingForm.phoneNumber}</p>}
                              <p className="text-muted text-xs mt-1">
                                {shippingForm.addressLine1}
                                {shippingForm.addressLine2 && `, ${shippingForm.addressLine2}`}
                              </p>
                              <p className="text-muted text-xs">
                                {shippingForm.city}, {shippingForm.province}
                                {shippingForm.postalCode && ` ${shippingForm.postalCode}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted text-sm">No address selected</p>
                      )}
                    </div>
                  )}
                  
                  {/* Payment Method */}
                  {step >= 3 && (
                    <div className="mb-6">
                      <h3 className="text-sm text-muted font-light mb-3">Payment Method</h3>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2">
                          {paymentMethod === "paynow" && <CreditCard className="h-4 w-4 text-accent" />}
                          {paymentMethod === "paypal" && <span className="text-accent font-bold text-xs">PP</span>}
                          {paymentMethod === "cash" && <Truck className="h-4 w-4 text-accent" />}
                          <span className="text-white font-light text-sm capitalize">
                            {paymentMethod === "paynow" ? "Pay Now" : paymentMethod === "paypal" ? "PayPal" : "Cash on Delivery"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="glass-card rounded-lg p-6">
                  <h2 className="text-xl font-light text-white mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-light text-sm truncate">{item.name}</p>
                          <p className="text-muted text-xs">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-white font-light">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between text-muted font-light">
                      <span>Subtotal</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted font-light">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                    </div>
                    <div className="flex justify-between text-muted font-light">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white text-lg font-light pt-3 border-t border-white/10">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 text-muted">
                      <Shield className="h-5 w-5" />
                      <span className="text-sm font-light">Buyer Protection Guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted mt-2">
                      <Truck className="h-5 w-5" />
                      <span className="text-sm font-light">Free returns within 30 days</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
