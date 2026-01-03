"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { removeFromCart, updateQuantity, clearCart } from "@/lib/features/cart-slice"
import { Navigation } from "@/components/navigation"
import { Trash2, Minus, Plus, Lock, CreditCard, Truck, Shield, ChevronRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const { items, total } = useSelector((state: RootState) => state.cart)
  const [step, setStep] = useState(1)
  const [orderComplete, setOrderComplete] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")

  const shipping = total > 500 ? 0 : 49.99
  const tax = total * 0.0825
  const grandTotal = total + shipping + tax

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change)
      dispatch(updateQuantity({ id, quantity: newQuantity }))
    }
  }

  const handlePlaceOrder = () => {
    setOrderComplete(true)
    dispatch(clearCart())
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
                <Link href="/dashboard">
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
                                onClick={() => dispatch(removeFromCart(item.id))}
                                className="text-muted hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-white font-light w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
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
                    <div className="glass-card rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted font-light mb-2 block">First Name</label>
                          <Input placeholder="John" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                          <label className="text-sm text-muted font-light mb-2 block">Last Name</label>
                          <Input placeholder="Doe" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted font-light mb-2 block">Address</label>
                          <Input placeholder="123 Premium Lane" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                          <label className="text-sm text-muted font-light mb-2 block">City</label>
                          <Input placeholder="Beverly Hills" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div>
                          <label className="text-sm text-muted font-light mb-2 block">ZIP Code</label>
                          <Input placeholder="90210" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-muted font-light mb-2 block">Phone</label>
                          <Input placeholder="+1 (555) 123-4567" className="bg-white/5 border-white/10 text-white" />
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-light text-white mb-4">Shipping Method</h3>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer border border-accent/50">
                            <div className="flex items-center gap-3">
                              <input type="radio" name="shipping" defaultChecked className="accent-accent" />
                              <div>
                                <p className="text-white font-light">Express Delivery</p>
                                <p className="text-muted text-sm font-light">1-2 business days</p>
                              </div>
                            </div>
                            <span className="text-white font-light">{shipping === 0 ? "Free" : `$${shipping}`}</span>
                          </label>
                          <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input type="radio" name="shipping" className="accent-accent" />
                              <div>
                                <p className="text-white font-light">Standard Delivery</p>
                                <p className="text-muted text-sm font-light">5-7 business days</p>
                              </div>
                            </div>
                            <span className="text-white font-light">$19.99</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                        Back
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1">
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
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setPaymentMethod("card")}
                            className={`p-4 rounded-lg border transition-all ${
                              paymentMethod === "card"
                                ? "border-accent bg-accent/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <CreditCard className="h-6 w-6 mx-auto mb-2 text-white" />
                            <p className="text-white font-light text-sm">Credit/Debit Card</p>
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

                      {/* Card Payment Form */}
                      {paymentMethod === "card" && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-muted font-light mb-2 block">Card Number</label>
                            <div className="relative">
                              <Input
                                placeholder="4242 4242 4242 4242"
                                className="bg-white/5 border-white/10 text-white pl-12"
                              />
                              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-muted font-light mb-2 block">Expiry Date</label>
                              <Input placeholder="MM/YY" className="bg-white/5 border-white/10 text-white" />
                            </div>
                            <div>
                              <label className="text-sm text-muted font-light mb-2 block">CVV</label>
                              <Input placeholder="123" className="bg-white/5 border-white/10 text-white" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-muted font-light mb-2 block">Cardholder Name</label>
                            <Input placeholder="John Doe" className="bg-white/5 border-white/10 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Cash on Delivery Info */}
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
                      <Button onClick={handlePlaceOrder} className="flex-1 bg-accent hover:bg-accent/90">
                        <Lock className="h-4 w-4 mr-2" />
                        {paymentMethod === "card" ? "Pay Now" : "Confirm Order"} • ${grandTotal.toFixed(2)}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-card rounded-lg p-6 sticky top-32"
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
