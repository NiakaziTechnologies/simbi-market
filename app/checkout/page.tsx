"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuth } from "@/lib/auth/auth-context"
import { createOrderFromCart, type CreateOrderResponse } from "@/lib/api/orders"
import { getAddresses, createAddress, type Address } from "@/lib/api/addresses"
import { createGuestOrder, type GuestOrderResponse } from "@/lib/api/guest-orders"
import { getCommerceShippingConfig } from "@/lib/api/commerce-shipping-config"
import type { CommerceShippingConfigData } from "@/lib/api/commerce-shipping-config"
import { postCommerceShippingQuote, type ShippingQuoteData } from "@/lib/api/commerce-shipping-quote"
import {
  countDistinctSellers,
  estimateShippingTotal,
  roundShippingCents,
} from "@/lib/commerce/shipping-estimate"
import { masterProductIdForShippingQuote } from "@/lib/commerce/cart-master-product"
import { haversineKm } from "@/lib/commerce/haversine-km"
import { WAREHOUSE_POSITION } from "@/lib/commerce/warehouse-location"
import type { DeliveryLocationSavePayload } from "@/lib/geocode/types"
import { Navigation } from "@/components/navigation"
import { Trash2, Minus, Plus, Lock, CreditCard, Truck, Shield, ChevronRight, ChevronDown, ShoppingBag, Loader2, MapPin, PlusCircle, Smartphone, Building2, Map, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

const DeliveryLocationModal = dynamic(
  () =>
    import("@/components/checkout/delivery-location-modal").then(
      (m) => m.DeliveryLocationModal
    ),
  { ssr: false, loading: () => null }
)

type CarrierQuoteEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: ShippingQuoteData }
  | { status: "err"; message: string }

export default function CheckoutPage() {
  const { items, total } = useSelector((state: RootState) => state.cart)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { loadCart, updateQuantity, removeFromCart, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null)
const [paymentMethod, setPaymentMethod] = useState<"paynow_cards" | "paynow_zimswitch" | "paynow_ecocash" | "paynow_onemoney" | "paynow_telecash" | "paynow_bank" | "paypal" | "cash" | "pickup">("paynow_cards")
  const [pickupLocation, setPickupLocation] = useState<"avana" | "office">("avana")
  const [selectedChannel, setSelectedChannel] = useState<"cards" | "zimswitch" | "ecocash" | "onemoney" | "telecash" | "bank">("cards")
  const [showPayNowChannels, setShowPayNowChannels] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  
  // Addresses state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  
  // Guest buyer information (for non-authenticated users)
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })

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

  // Public shipping config (no auth) — fixed vs distance + rates
  const [shippingConfig, setShippingConfig] = useState<CommerceShippingConfigData | null>(null)
  const [shippingConfigLoading, setShippingConfigLoading] = useState(true)
  const [shippingConfigError, setShippingConfigError] = useState(false)
  const [regionCode, setRegionCode] = useState("DEFAULT")
  const [carrierQuoteBySeller, setCarrierQuoteBySeller] = useState<Record<string, CarrierQuoteEntry>>({})
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [deliveryDropLatLng, setDeliveryDropLatLng] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const deliveryDistanceKm = useMemo(() => {
    if (!deliveryDropLatLng) return null
    return haversineKm(WAREHOUSE_POSITION, deliveryDropLatLng)
  }, [deliveryDropLatLng])

  const sellerCount = useMemo(() => countDistinctSellers(items), [items])

  /** Lines per seller for carrier_v1 quote API (`masterProductId` from cart item). */
  const sellerQuoteLineGroups = useMemo(() => {
    const map = new Map<string, { masterProductId: string; quantity: number }[]>()
    for (const item of items) {
      const sid = item.sellerId
      if (!sid) continue
      const masterProductId = masterProductIdForShippingQuote(item)
      const lines = map.get(sid) ?? []
      const idx = lines.findIndex((l) => l.masterProductId === masterProductId)
      if (idx >= 0) lines[idx] = { ...lines[idx], quantity: lines[idx].quantity + item.quantity }
      else lines.push({ masterProductId, quantity: item.quantity })
      map.set(sid, lines)
    }
    return map
  }, [items])

  const sellerFingerprint = useMemo(
    () =>
      [...items]
        .map((i) => i.sellerId || i.inventoryId || i.id)
        .sort()
        .join(","),
    [items]
  )

  const loadShippingConfig = useCallback(() => {
    setShippingConfigLoading(true)
    setShippingConfigError(false)
    getCommerceShippingConfig()
      .then((data) => {
        setShippingConfig(data)
        setShippingConfigError(false)
      })
      .catch(() => {
        setShippingConfig(null)
        setShippingConfigError(true)
      })
      .finally(() => setShippingConfigLoading(false))
  }, [])

  useEffect(() => {
    loadShippingConfig()
  }, [loadShippingConfig, sellerFingerprint])

  useEffect(() => {
    if (shippingConfig?.mode !== "distance") {
      setDeliveryDropLatLng(null)
      setDeliveryModalOpen(false)
    }
  }, [shippingConfig?.mode])

  const isCarrierEngine = shippingConfig?.shippingEngine === "carrier_v1"

  useEffect(() => {
    if (!shippingConfig || !isCarrierEngine) {
      setCarrierQuoteBySeller({})
      return
    }
    if (paymentMethod === "pickup") {
      setCarrierQuoteBySeller({})
      return
    }
    const entries = [...sellerQuoteLineGroups.entries()].filter(([, lines]) => lines.length > 0)
    if (entries.length === 0) {
      setCarrierQuoteBySeller({})
      return
    }
    let cancelled = false
    const loadingMap: Record<string, CarrierQuoteEntry> = {}
    for (const [sid] of entries) loadingMap[sid] = { status: "loading" }
    setCarrierQuoteBySeller(loadingMap)

    void Promise.all(
      entries.map(async ([sellerId, lines]) => {
        try {
          const data = await postCommerceShippingQuote({
            sellerId,
            lines,
            deliveryDistanceKm:
              deliveryDistanceKm != null && Number.isFinite(deliveryDistanceKm) && deliveryDistanceKm >= 0
                ? deliveryDistanceKm
                : undefined,
            regionCode: regionCode.trim() || undefined,
            currency: "USD",
          })
          return { sellerId, ok: true as const, data }
        } catch (e) {
          return {
            sellerId,
            ok: false as const,
            message: (e as Error).message || "Quote failed",
          }
        }
      })
    ).then((results) => {
      if (cancelled) return
      const next: Record<string, CarrierQuoteEntry> = {}
      for (const r of results) {
        if (r.ok) next[r.sellerId] = { status: "ok", data: r.data }
        else next[r.sellerId] = { status: "err", message: r.message }
      }
      setCarrierQuoteBySeller(next)
    })
    return () => {
      cancelled = true
    }
  }, [
    shippingConfig,
    isCarrierEngine,
    sellerQuoteLineGroups,
    deliveryDistanceKm,
    regionCode,
    paymentMethod,
    sellerFingerprint,
  ])

  const shippingEstimate = useMemo(() => {
    if (!shippingConfig) return null
    if (paymentMethod === "pickup") {
      return {
        amount: 0,
        usedDistanceFormula: false,
        usedFlatFallback: false,
        pendingDistanceSelection: false,
      }
    }
    if (isCarrierEngine) {
      const sellerIds = [...sellerQuoteLineGroups.keys()].filter((sid) => (sellerQuoteLineGroups.get(sid)?.length ?? 0) > 0)
      if (sellerIds.length === 0) {
        return {
          amount: 0,
          usedDistanceFormula: false,
          usedFlatFallback: false,
          pendingDistanceSelection: false,
          usedCarrierQuotes: true,
        }
      }
      if (sellerIds.some((sid) => !carrierQuoteBySeller[sid] || carrierQuoteBySeller[sid].status === "loading")) {
        return {
          amount: null,
          usedDistanceFormula: false,
          usedFlatFallback: false,
          pendingDistanceSelection: false,
          pendingCarrierQuotes: true,
        }
      }
      if (sellerIds.some((sid) => carrierQuoteBySeller[sid].status === "err")) {
        return {
          amount: null,
          usedDistanceFormula: false,
          usedFlatFallback: false,
          pendingDistanceSelection: false,
          carrierQuoteError: true,
        }
      }
      const sum = sellerIds.reduce((acc, sid) => {
        const e = carrierQuoteBySeller[sid]
        if (e.status !== "ok") return acc
        return acc + (Number(e.data.cost) || 0)
      }, 0)
      return {
        amount: roundShippingCents(sum),
        usedDistanceFormula: false,
        usedFlatFallback: false,
        pendingDistanceSelection: false,
        usedCarrierQuotes: true,
      }
    }
    return estimateShippingTotal(shippingConfig, sellerCount, deliveryDistanceKm)
  }, [
    shippingConfig,
    sellerCount,
    deliveryDistanceKm,
    paymentMethod,
    isCarrierEngine,
    sellerQuoteLineGroups,
    carrierQuoteBySeller,
  ])

  const shippingNumericForTotal =
    shippingEstimate?.amount != null ? shippingEstimate.amount : 0
  const tax = total * 0.145
  const grandTotal = total + shippingNumericForTotal + tax

  const shippingRowPending =
    paymentMethod !== "pickup" &&
    ((shippingConfig?.mode === "distance" && shippingEstimate?.pendingDistanceSelection === true) ||
      (isCarrierEngine && shippingEstimate?.pendingCarrierQuotes === true))

  const handleDeliverySave = useCallback((payload: DeliveryLocationSavePayload) => {
    setDeliveryDropLatLng(payload.location)
    if (payload.location && payload.shippingFromPin) {
      const s = payload.shippingFromPin
      setShippingForm((prev) => ({
        ...prev,
        ...(s.addressLine1 ? { addressLine1: s.addressLine1 } : {}),
        ...(s.city ? { city: s.city } : {}),
        ...(s.province ? { province: s.province } : {}),
      }))
    }
  }, [])

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
            // NO auto-selection - user must choose
            // setSelectedAddressId(null)
          })
          .catch((error) => {
            console.error('Checkout page: Error loading addresses:', error)
          })
          .finally(() => {
            setIsLoadingAddresses(false)
          })
      } else {
        // Guest user - load cart from localStorage
        console.log('Checkout page: Guest user, loading cart from localStorage...')
        loadCart().catch((error) => {
          console.error('Checkout page: Error loading guest cart:', error)
        })
      }
    }
  }, [isAuthenticated, authLoading, loadCart])

  const handleQuantityChange = async (item: typeof items[0], change: number) => {
    // Use cartItemId if available (authenticated), otherwise use id (guest)
    const itemId = item.cartItemId || item.id
    if (!itemId || updatingItems.has(itemId)) {
      return
    }

    const newQuantity = Math.max(1, item.quantity + change)
    setUpdatingItems((prev) => new Set(prev).add(itemId))
    
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemoveItem = async (item: typeof items[0]) => {
    // Use cartItemId if available (authenticated), otherwise use id (guest)
    const itemId = item.cartItemId || item.id
    if (!itemId || removingItems.has(itemId)) {
      return
    }

    setRemovingItems((prev) => new Set(prev).add(itemId))
    
    try {
      await removeFromCart(itemId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
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
      if (isAuthenticated) {
        // Authenticated user - use regular order API
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
        if (paymentMethod) orderRequest.paymentMethod = paymentMethod

        const needsLegacyDistance =
          shippingConfig?.shippingEngine !== "carrier_v1" &&
          shippingConfig?.mode === "distance" &&
          paymentMethod !== "pickup"

        if (
          needsLegacyDistance &&
          (deliveryDistanceKm == null ||
            !Number.isFinite(deliveryDistanceKm) ||
            deliveryDistanceKm < 0)
        ) {
          alert(
            "Please open the map on the Shipping step and choose your delivery location."
          )
          setIsPlacingOrder(false)
          return
        }

        if (deliveryDistanceKm != null && Number.isFinite(deliveryDistanceKm) && deliveryDistanceKm >= 0) {
          orderRequest.deliveryDistanceKm = deliveryDistanceKm
        }
        if (regionCode.trim()) {
          orderRequest.regionCode = regionCode.trim()
        }

        // Create order from cart
        const response = await createOrderFromCart(orderRequest)
        
        // Store order data and clear cart  
        setOrderData(response)
        await clearCart()
        setOrderComplete(true)
      } else {
        // Guest user - use guest order API
        // Validate guest information
        if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phoneNumber) {
          alert('Please fill in all required buyer information (First Name, Last Name, Email, Phone Number).')
          setIsPlacingOrder(false)
          return
        }

        // Validate phone number length
        if (guestInfo.phoneNumber.length < 7) {
          alert('Phone number must be at least 7 characters long.')
          setIsPlacingOrder(false)
          return
        }

        // Validate shipping address
        if (!shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province) {
          alert('Please fill in all required shipping address fields.')
          setIsPlacingOrder(false)
          return
        }

        // Validate cart has items
        if (items.length === 0) {
          alert('Your cart is empty.')
          setIsPlacingOrder(false)
          return
        }

        // Prepare guest order request
        // Auto-populate shipping name and phone from buyer info if not explicitly set
        const shippingFullName = shippingForm.fullName || `${guestInfo.firstName} ${guestInfo.lastName}`.trim()
        const shippingPhoneNumber = shippingForm.phoneNumber || guestInfo.phoneNumber
        
        const guestOrderRequest = {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phoneNumber: guestInfo.phoneNumber,
          paymentMethod,
          shippingAddress: {
            fullName: shippingFullName,
            phoneNumber: shippingPhoneNumber,
            addressLine1: shippingForm.addressLine1,
            addressLine2: shippingForm.addressLine2,
            city: shippingForm.city,
            province: shippingForm.province,
            postalCode: shippingForm.postalCode,
          },
          items: items
            .filter(item => item.inventoryId) // Only include items with inventoryId
            .map(item => ({
              inventoryId: item.inventoryId!,
              quantity: item.quantity,
            })),
          notes: orderDetails.notes,
          currency: "USD" as const,
          ...(deliveryDistanceKm != null &&
          Number.isFinite(deliveryDistanceKm) &&
          deliveryDistanceKm >= 0
            ? { deliveryDistanceKm }
            : {}),
        }

        if (guestOrderRequest.items.length === 0) {
          alert('No valid items in cart. Please add items to your cart.')
          setIsPlacingOrder(false)
          return
        }

        const needsLegacyDistanceGuest =
          shippingConfig?.shippingEngine !== "carrier_v1" &&
          shippingConfig?.mode === "distance" &&
          paymentMethod !== "pickup"

        if (
          needsLegacyDistanceGuest &&
          (deliveryDistanceKm == null ||
            !Number.isFinite(deliveryDistanceKm) ||
            deliveryDistanceKm < 0)
        ) {
          alert(
            "Please open the map on the Shipping step and choose your delivery location."
          )
          setIsPlacingOrder(false)
          return
        }

        const response = await createGuestOrder({
          ...guestOrderRequest,
          ...(regionCode.trim() ? { regionCode: regionCode.trim() } : {}),
        })
        
        // Store order data (convert to similar format as authenticated order)
        setOrderData({
          orders: response.orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            currency: order.currency,
          })),
          orderNumber: response.orderNumber,
        } as any)
        
        await clearCart()
        setOrderComplete(true)
      }
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
        <section className="pt-32 pb-16 px-6 bg-background dark:bg-black">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="glass-card dark:glass-card rounded-lg p-12 text-center"
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
              <h1 className="text-4xl font-light text-foreground dark:text-white mb-4">Order Confirmed</h1>
              <p className="text-muted-foreground dark:text-muted font-light mb-2">Thank you for your purchase</p>
              <p className="text-sm text-muted-foreground dark:text-muted font-light mb-8">
                {orderData?.orders?.[0]?.orderNumber ? `Order #${orderData.orders[0].orderNumber}` : 'Order placed successfully'} • Confirmation sent to your email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link href="/dashboard/buyer/orders">
                    <Button className="w-full sm:w-auto">View Order</Button>
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground dark:text-muted font-light">
                    You will receive order updates via email
                  </p>
                )}
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
        <section className="pt-32 pb-16 px-6 bg-background dark:bg-black">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card dark:glass-card rounded-lg p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-light text-foreground dark:text-white mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground dark:text-muted font-light mb-8">Add some premium parts to get started</p>
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

      <section className="pt-32 pb-16 px-6 bg-background dark:bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground dark:text-white mb-4">
              Secure <span className="font-semibold">Checkout</span>
            </h1>
            <p className="text-muted-foreground dark:text-muted font-light">Complete your order with confidence</p>
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
                      ? "bg-foreground text-background dark:bg-white dark:text-black"
                      : step > index + 1
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-foreground dark:bg-white/5 dark:text-muted"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      step === index + 1 ? "bg-background text-foreground dark:bg-black dark:text-white" : step > index + 1 ? "bg-accent text-white" : ""
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-light hidden sm:inline">{stepName}</span>
                </button>
                {index < 2 && <ChevronRight className="h-5 w-5 text-muted-foreground dark:text-muted mx-2" />}
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
                    <h2 className="text-2xl font-light text-foreground dark:text-white mb-6">Review Your Items</h2>
                    {items.map((item) => (
                      <div key={item.id} className="glass-card dark:glass-card rounded-lg p-6">
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
                                <h3 className="text-lg font-light text-foreground dark:text-white">{item.name}</h3>
                                <p className="text-muted-foreground dark:text-muted font-light text-sm">{item.category}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item)}
                                className="text-muted-foreground dark:text-muted hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={removingItems.has(item.cartItemId || item.id)}
                              >
                                {removingItems.has(item.cartItemId || item.id) ? (
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
                                  className="w-8 h-8 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center hover:bg-muted/80 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={updatingItems.has(item.cartItemId || item.id) || item.quantity <= 1}
                                >
                                  {updatingItems.has(item.cartItemId || item.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Minus className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="text-foreground dark:text-white font-light w-8 text-center">
                                  {updatingItems.has(item.cartItemId || item.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item, 1)}
                                  className="w-8 h-8 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center hover:bg-muted/80 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={updatingItems.has(item.cartItemId || item.id)}
                                >
                                  {updatingItems.has(item.cartItemId || item.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              <span className="text-xl font-light text-foreground dark:text-white">
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
                    <h2 className="text-2xl font-light text-foreground dark:text-white mb-6">Shipping Information</h2>

                    {paymentMethod !== "pickup" ? (
                      <div className="glass-card dark:glass-card rounded-lg p-4 mb-6 border border-border dark:border-white/10">
                        <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                          Logistics region code (optional)
                        </label>
                        <Input
                          value={regionCode}
                          onChange={(e) => setRegionCode(e.target.value)}
                          placeholder="DEFAULT"
                          className="max-w-xs bg-background dark:bg-white/5 border-border dark:border-white/10"
                        />
                        <p className="text-xs text-muted-foreground dark:text-muted mt-2 font-light">
                          Used for <span className="font-mono">carrier_v1</span> quotes and when creating your order. Leave as{" "}
                          <span className="font-mono">DEFAULT</span> if unsure.
                        </p>
                      </div>
                    ) : null}
                    
                    {/* Guest Buyer Information (only for non-authenticated users) */}
                    {!isAuthenticated && (
                      <div className="glass-card dark:glass-card rounded-lg p-6 mb-6 border border-border dark:border-white/10">
                        <h3 className="text-lg font-light text-foreground dark:text-white mb-4">Buyer Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              First Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              placeholder="John"
                              value={guestInfo.firstName}
                              onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                              required
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Last Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              placeholder="Doe"
                              value={guestInfo.lastName}
                              onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                              required
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Email Address <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="email"
                              placeholder="john.doe@example.com"
                              value={guestInfo.email}
                              onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                              required
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Phone Number <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="tel"
                              placeholder="0771234567"
                              value={guestInfo.phoneNumber}
                              onChange={(e) => setGuestInfo({ ...guestInfo, phoneNumber: e.target.value })}
                              required
                              minLength={7}
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                            {guestInfo.phoneNumber && guestInfo.phoneNumber.length > 0 && guestInfo.phoneNumber.length < 7 && (
                              <p className="text-sm text-destructive mt-1">Phone number must be at least 7 characters</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Shipping Address Form - Different for authenticated vs guest */}
                    {isAuthenticated ? (
                      <>
                        {/* Saved Addresses (only for authenticated users) */}
                        {!showNewAddressForm && (
                          <div className="space-y-4 mb-6">
                            {isLoadingAddresses ? (
                              <div className="glass-card dark:glass-card rounded-lg p-6 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-accent" />
                                <p className="text-muted-foreground dark:text-muted text-sm">Loading addresses...</p>
                              </div>
                            ) : savedAddresses.length > 0 ? (
                              <>
                                <h3 className="text-lg font-light text-foreground dark:text-white mb-4">Select Shipping Address</h3>
                                <div className="space-y-3">
                                  {savedAddresses.map((address) => (
                                    <label
                                      key={address.id}
                                      className={`block glass-card dark:glass-card rounded-lg p-4 cursor-pointer border-2 transition-all ${
                                        selectedAddressId === address.id
                                          ? 'border-accent bg-accent/10'
                                          : 'border-border dark:border-white/10 hover:border-accent dark:hover:border-white/20'
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
                                            <span className="text-foreground dark:text-white font-light">{address.fullName}</span>
                                            {address.isDefault && (
                                              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Default</span>
                                            )}
                                          </div>
                                          <p className="text-muted-foreground dark:text-muted text-sm">{address.phoneNumber}</p>
                                          <p className="text-muted-foreground dark:text-muted text-sm mt-1">
                                            {address.addressLine1}
                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                          </p>
                                          <p className="text-muted-foreground dark:text-muted text-sm">
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
                              className="w-full bg-transparent border-border dark:border-white/20 hover:bg-muted dark:hover:bg-white/5"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add New Address
                            </Button>
                          </div>
                        )}
                        
                        {/* New Address Form (authenticated users) */}
                        {showNewAddressForm && (
                          <div className="glass-card dark:glass-card rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-light text-foreground dark:text-white">New Shipping Address</h3>
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
                                className="text-muted-foreground dark:text-muted hover:text-foreground dark:hover:text-white"
                              >
                                Cancel
                              </Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Full Name</label>
                                <Input 
                                  placeholder="John Doe" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.fullName}
                                  onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Phone Number</label>
                                <Input 
                                  placeholder="+263771234567" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.phoneNumber}
                                  onChange={(e) => setShippingForm({ ...shippingForm, phoneNumber: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Address Line 1 <span className="text-destructive">*</span></label>
                                <Input 
                                  placeholder="123 Main Street" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.addressLine1}
                                  onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Address Line 2 (Optional)</label>
                                <Input 
                                  placeholder="Apartment 4B" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.addressLine2}
                                  onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">City <span className="text-destructive">*</span></label>
                                <Input 
                                  placeholder="Harare" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.city}
                                  onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Province/State <span className="text-destructive">*</span></label>
                                <Input 
                                  placeholder="Harare" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.province}
                                  onChange={(e) => setShippingForm({ ...shippingForm, province: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Postal Code</label>
                                <Input 
                                  placeholder="00263" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                  value={shippingForm.postalCode}
                                  onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Country</label>
                                <Input 
                                  placeholder="Zimbabwe" 
                                  className="bg-background dark:bg-white/5 border-border dark:border-white/10"
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
                                  <span className="text-sm text-muted-foreground dark:text-muted font-light">Set as default address</span>
                                </label>
                              </div>
                            </div>
                            <Button
                              onClick={handleSaveNewAddress}
                              className="w-full mt-4 bg-accent hover:bg-accent/90"
                              disabled={isLoadingAddresses || !shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province}
                            >
                              {isLoadingAddresses ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Address"
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Guest Shipping Address Form (simplified - only required fields) */
                      <div className="glass-card dark:glass-card rounded-lg p-6 mb-6 border border-border dark:border-white/10">
                        <h3 className="text-lg font-light text-foreground dark:text-white mb-4">Shipping Address</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Address Line 1 <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              placeholder="123 Main Street"
                              value={shippingForm.addressLine1}
                              onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                              required
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Address Line 2 (Optional)
                            </label>
                            <Input
                              type="text"
                              placeholder="Apartment 4B"
                              value={shippingForm.addressLine2}
                              onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              City <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              placeholder="Harare"
                              value={shippingForm.city}
                              onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                              required
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Province <span className="text-destructive">*</span>
                            </label>
                            <Input
                              type="text"
                              placeholder="Harare"
                              value={shippingForm.province}
                              onChange={(e) => setShippingForm({ ...shippingForm, province: e.target.value })}
                              required
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">
                              Postal Code (Optional)
                            </label>
                            <Input
                              type="text"
                              placeholder="00263"
                              value={shippingForm.postalCode}
                              onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                              className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {shippingConfig?.mode === "distance" && (
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2 text-sm font-light text-foreground dark:text-white">
                          {deliveryDropLatLng ? (
                            <Check
                              className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                              aria-hidden
                            />
                          ) : (
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span>
                            {deliveryDropLatLng ? "Delivery pin saved" : "Delivery pin"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                          onClick={() => setDeliveryModalOpen(true)}
                        >
                          <Map className="mr-2 h-4 w-4" />
                          Map
                        </Button>
                      </div>
                    )}
                    
                    {/* Order Details Section */}
                    <div className="glass-card dark:glass-card rounded-lg p-6">
                      <h3 className="text-lg font-light text-foreground dark:text-white mb-4">Order Details (Optional)</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {isAuthenticated && (
                          <>
                            <div>
                              <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">PO Number</label>
                              <Input 
                                placeholder="PO-2024-001" 
                                className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                value={orderDetails.poNumber}
                                onChange={(e) => setOrderDetails({ ...orderDetails, poNumber: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Cost Center</label>
                              <Input 
                                placeholder="ENGINEERING" 
                                className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                value={orderDetails.costCenter}
                                onChange={(e) => setOrderDetails({ ...orderDetails, costCenter: e.target.value })}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Coupon Code</label>
                              <Input 
                                placeholder="DISCOUNT10" 
                                className="bg-background dark:bg-white/5 border-border dark:border-white/10"
                                value={orderDetails.couponCode}
                                onChange={(e) => setOrderDetails({ ...orderDetails, couponCode: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                        <div className={isAuthenticated ? "md:col-span-2" : ""}>
                          <label className="text-sm text-muted-foreground dark:text-muted font-light mb-2 block">Order Notes</label>
                          <textarea
                            placeholder="Special delivery instructions or notes..."
                            className="w-full bg-background dark:bg-white/5 border border-border dark:border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
                            value={orderDetails.notes}
                            onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons for Step 2 */}
                    <div className="flex gap-4 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-transparent border-border dark:border-white/20 hover:bg-muted dark:hover:bg-white/5"
                      >
                        Back to Cart
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1 bg-accent hover:bg-accent/90"
                        disabled={
                          (isAuthenticated && !selectedAddressId && !showNewAddressForm) ||
                          (isAuthenticated && showNewAddressForm && (!shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province)) ||
                          (!isAuthenticated && (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phoneNumber || guestInfo.phoneNumber.length < 7 || !shippingForm.addressLine1 || !shippingForm.city || !shippingForm.province))
                        }
                      >
                        Continue to Review
                        <ChevronRight className="h-4 w-4 ml-2" />
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
                    <h2 className="text-2xl font-light text-foreground dark:text-white mb-6">Payment Details</h2>
                    <div className="glass-card dark:glass-card rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Lock className="h-4 w-4 text-accent" />
                        <span className="text-sm text-muted-foreground dark:text-muted font-light">Secure 256-bit SSL encryption</span>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="mb-6">
                        <label className="text-sm text-muted-foreground dark:text-muted font-light mb-3 block">Payment Method</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <button
onClick={() => {
  setPaymentMethod("paynow_cards");
  setSelectedChannel("cards");
  setShowPayNowChannels(true);
}}
                            className={`p-4 rounded-lg border transition-all col-span-2 md:col-span-1 ${
                              paymentMethod.startsWith("paynow")
                                ? "border-accent bg-accent/10"
                                : "border-border dark:border-white/10 bg-muted dark:bg-white/5 hover:border-accent dark:hover:border-white/20"
                            }`}
                          >
                            <CreditCard className="h-6 w-6 mx-auto mb-2 text-foreground dark:text-white" />
                            <p className="text-foreground dark:text-white font-light text-sm">PayNow & Local</p>
                            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showPayNowChannels ? 'rotate-180' : ''}`} />
                          </button>
{showPayNowChannels && (
                            <div className="col-span-2 md:col-span-3 grid grid-cols-3 md:grid-cols-6 gap-2 p-2 bg-accent/5 rounded-lg">
                              {[
                                { id: 'cards', label: 'VISA' },
                                { id: 'zimswitch', label: 'ZimSwitch' },
                                { id: 'ecocash', label: 'EcoCash' },
                                { id: 'onemoney', label: 'OneMoney' },
                                { id: 'telecash', label: 'TeleCash' },
                                { id: 'bank', label: 'Bank Transfer' }
                              ].map(({ id, label }) => (
                                <button
                                  key={id}
                                  onClick={() => {
                                    const method = `paynow_${id}` as typeof paymentMethod
                                    setPaymentMethod(method)
                                    setSelectedChannel(id as any)
                                    setShowPayNowChannels(false)
                                  }}
                                  className={`p-2 rounded border transition-all flex flex-col items-center gap-1 ${
                                    paymentMethod === `paynow_${id}`
                                      ? "border-accent bg-accent/20 shadow-md"
                                      : "border-border dark:border-white/10 hover:border-accent hover:bg-accent/10"
                                  }`}
                                >
                                  {id === 'cards' ? (
                                    <Image src="/new/visa.jpg" alt="Visa" width={32} height={32} className="w-8 h-8 object-contain rounded" />
                                  ) : id === 'bank' ? (
                                    <Building2 className="h-4 w-4" />
                                  ) : (
                                    <Image 
src={`/new/${id === 'ecocash' ? 'EcoCash.png' : id === 'telecash' ? 'Telecash.png' : id === 'onemoney' ? '1money.jpeg' : 'zimswitch.jpeg'}`.trim()}
                                      alt={label} 
                                      width={32} 
                                      height={32} 
                                      className="w-8 h-8 object-contain rounded" 
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => setPaymentMethod("paypal")}
                            className={`p-4 rounded-lg border transition-all ${
                              paymentMethod === "paypal"
                                ? "border-accent bg-accent/10"
                                : "border-border dark:border-white/10 bg-muted dark:bg-white/5 hover:border-accent dark:hover:border-white/20"
                            }`}
                          >
                            <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-foreground dark:text-white font-bold text-xs">PP</span>
                            </div>
                            <p className="text-foreground dark:text-white font-light text-sm">PayPal</p>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("cash")}
                            className={`p-4 rounded-lg border transition-all ${
                              paymentMethod === "cash"
                                ? "border-accent bg-accent/10"
                                : "border-border dark:border-white/10 bg-muted dark:bg-white/5 hover:border-accent dark:hover:border-white/20"
                            }`}
                          >
                            <Truck className="h-6 w-6 mx-auto mb-2 text-foreground dark:text-white" />
                            <p className="text-foreground dark:text-white font-light text-sm">Cash on Delivery</p>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("pickup")}
                            className={`p-4 rounded-lg border transition-all col-span-2 md:col-span-1 ${
                              paymentMethod === "pickup"
                                ? "border-accent bg-accent/10"
                                : "border-border dark:border-white/10 bg-muted dark:bg-white/5 hover:border-accent dark:hover:border-white/20"
                            }`}
                          >
                            <div className="h-6 w-6 mx-auto mb-2">
                              <MapPin className="h-6 w-6 text-foreground dark:text-white" />
                            </div>
                            <p className="text-foreground dark:text-white font-light text-sm">Pickup</p>
                          </button>
                        </div>
                      </div>

                      {/* Payment Method Info */}
                      {paymentMethod.startsWith("paynow") && (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="h-6 w-6 text-accent" />
                            </div>
                            <div>
<h3 className="text-foreground dark:text-white font-light mb-2">PayNow - {selectedChannel === 'cards' ? 'Visa/Mastercard' : selectedChannel === 'zimswitch' ? 'ZimSwitch' : selectedChannel === 'ecocash' ? 'EcoCash' : selectedChannel === 'onemoney' ? 'OneMoney' : selectedChannel === 'telecash' ? 'TeleCash' : 'Bank Transfer'}</h3>
                              <p className="text-muted font-light text-sm leading-relaxed">
                                Complete payment via {selectedChannel === 'cards' || selectedChannel === 'zimswitch' ? 'card details' : selectedChannel === 'bank' ? 'bank transfer details' : 'mobile money'}. Secure gateway redirect.
                              </p>
                              {selectedChannel === 'ecocash' || selectedChannel === 'onemoney' || selectedChannel === 'telecash' && (
                                <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/30">
                                  <p className="text-green-400 font-medium text-sm">Enter your mobile number on next step</p>
                                </div>
                              )}
                              {selectedChannel === 'bank' && (
                                <div className="mt-4 p-3 bg-purple-500/10 rounded border border-purple-500/30">
                                  <p className="text-purple-400 font-medium text-sm">Use bank details shown after order confirmation</p>
                                </div>
                              )}
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
<h3 className="text-foreground dark:text-white font-light mb-2">PayPal</h3>
                              <p className="text-muted font-light text-sm leading-relaxed">
                                You will be redirected to PayPal to complete your payment.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

{paymentMethod === "pickup" && (
                        <div className="bg-white/5 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-6 w-6 text-accent" />
                            </div>
                            <div>

                              <h3 className="store-pickup-title text-foreground dark:text-white font-light mb-2">Store Pickup</h3>
                              <p className="text-muted font-light text-sm mb-3">Pick up your order from our fulfilment centers:</p>
                              <div className="space-y-2">
                                <div className={`p-3 rounded-lg border ${pickupLocation === 'avana' ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'}`}>
                                  <label className="flex items-start gap-2 cursor-pointer w-full">
                                    <input
                                      type="radio"
                                      name="pickup"
                                      checked={pickupLocation === 'avana'}
                                      onChange={() => setPickupLocation('avana')}
                                      className="mt-1 accent-accent"
                                    />
                                    <div>
                                      <div className="font-medium text-white pickup-location-text text-sm shadow-text">🎯 Avana Motors</div>
                                      <div className="text-white/90 pickup-location-text text-xs shadow-text">7 Botha Road, Cnr St Patricks, Seke Rd<br/>Harare</div>
                                    </div>
                                  </label>
                                </div>
                                <div className={`p-3 rounded-lg border ${pickupLocation === 'office' ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'}`}>
                                  <label className="flex items-start gap-2 cursor-pointer w-full">
                                    <input
                                      type="radio"
                                      name="pickup"
                                      checked={pickupLocation === 'office'}
                                      onChange={() => setPickupLocation('office')}
                                      className="mt-1 accent-accent"
                                    />
                                    <div>
                                      <div className="font-medium text-white pickup-location-text text-sm shadow-text">🏢 Simbi Market Office</div>
                                      <div className="text-white/90 pickup-location-text text-xs shadow-text">ZB Centre 4th floor<br/>Corner First Street and Union Ave, Harare</div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-accent/10 rounded border border-accent">
                                <p className="text-accent font-medium text-sm">Free pickup • No delivery fees</p>
                              </div>
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
<h3 className="text-foreground dark:text-white font-light mb-2">Cash on Delivery</h3>
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
                        disabled={
                          isPlacingOrder ||
                          (shippingEstimate?.pendingCarrierQuotes ?? false) ||
                          (shippingEstimate?.carrierQuoteError ?? false)
                        }
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
                <div className="glass-card dark:glass-card rounded-lg p-6">
                  <h2 className="text-xl font-light text-foreground dark:text-white mb-6">Order Preview</h2>
                  
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
                      <h3 className="text-sm text-muted-foreground dark:text-muted font-light mb-3">Payment Method</h3>
                      <div className="bg-muted dark:bg-white/5 rounded-lg p-4 border border-border dark:border-white/10">
                        <div className="flex items-center gap-2">
{paymentMethod.startsWith("paynow") && <CreditCard className="h-4 w-4 text-accent" />}
                          {paymentMethod === "paypal" && <span className="text-accent font-bold text-xs">PP</span>}
                          {paymentMethod === "cash" && <Truck className="h-4 w-4 text-accent" />}
                          <span className="text-foreground dark:text-white font-light text-sm capitalize">
{paymentMethod.startsWith("paynow") ? "PayNow " + (selectedChannel === 'cards' ? 'Cards' : selectedChannel === 'zimswitch' ? 'ZimSwitch' : selectedChannel === 'ecocash' ? 'EcoCash' : selectedChannel === 'onemoney' ? 'OneMoney' : selectedChannel === 'telecash' ? 'TeleCash' : 'Bank') : paymentMethod === "paypal" ? "PayPal" : paymentMethod === "cash" ? "Cash on Delivery" : "Pickup"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="glass-card dark:glass-card rounded-lg p-6">
                  <h2 className="text-xl font-light text-foreground dark:text-white mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground dark:text-white font-light text-sm truncate">{item.name}</p>
                          <p className="text-muted-foreground dark:text-muted text-xs">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-foreground dark:text-white font-light">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-border dark:border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between text-muted-foreground dark:text-muted font-light">
                      <span>Subtotal</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground dark:text-muted font-light items-start gap-2">
                      <span>Shipping</span>
                      <span className="text-right">
                        {shippingConfigLoading ? (
                          "…"
                        ) : shippingConfigError ? (
                          "—"
                        ) : paymentMethod === "pickup" ? (
                          <span className="text-green-600 dark:text-green-400">Free</span>
                        ) : shippingEstimate?.amount == null ? (
                          "…"
                        ) : (
                          `$${shippingEstimate.amount.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {shippingRowPending &&
                      !shippingConfigLoading &&
                      !shippingConfigError && (
                        <button
                          type="button"
                          onClick={() => {
                            setStep(2)
                            setDeliveryModalOpen(true)
                          }}
                          className="-mt-1 text-left text-xs font-light text-accent hover:underline"
                        >
                          {step >= 2
                            ? "Open delivery map"
                            : "Go to shipping & open map"}
                        </button>
                      )}
                    {shippingEstimate?.hint &&
                      !shippingConfigError &&
                      !shippingConfigLoading && (
                      <p className="text-xs text-muted-foreground dark:text-muted font-light -mt-1">
                        {shippingEstimate.hint}
                      </p>
                    )}
                    {shippingEstimate?.carrierQuoteError &&
                      !shippingConfigLoading &&
                      !shippingConfigError && (
                      <p className="text-xs text-destructive font-light -mt-1">
                        One or more seller shipping quotes failed. Adjust the cart or region code, then refresh the
                        page.
                      </p>
                    )}
                    {shippingConfigError && !shippingConfigLoading && (
                      <p className="text-xs text-muted-foreground dark:text-muted font-light -mt-1">
                        Shipping is finalized when your order is placed.
                      </p>
                    )}
                    <div className="flex justify-between text-muted-foreground dark:text-muted font-light">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-foreground dark:text-white text-lg font-light pt-3 border-t border-border dark:border-white/10">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-border dark:border-white/10">
                    <div className="flex items-center gap-3 text-muted-foreground dark:text-muted">
                      <Shield className="h-5 w-5" />
                      <span className="text-sm font-light">Buyer Protection Guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground dark:text-muted mt-2">
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

      {shippingConfig?.mode === "distance" && (
        <DeliveryLocationModal
          open={deliveryModalOpen}
          onOpenChange={setDeliveryModalOpen}
          warehouse={WAREHOUSE_POSITION}
          committed={deliveryDropLatLng}
          onSave={handleDeliverySave}
        />
      )}
    </main>
  )
}
