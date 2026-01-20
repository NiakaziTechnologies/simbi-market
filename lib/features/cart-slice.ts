import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Part } from "./parts-slice"
import type { CartItem as ApiCartItem, CartSummary } from "../api/cart"

export interface CartItem extends Part {
  quantity: number
  cartItemId?: string // Cart item ID from API (for API-managed items)
  inventoryId?: string // Seller inventory ID (required for API operations)
}

interface CartState {
  items: CartItem[]
  total: number
  isLoading: boolean
  lastSyncAt: string | null // Timestamp of last API sync
}

const initialState: CartState = {
  items: [],
  total: 0,
  isLoading: false,
  lastSyncAt: null,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Legacy reducer for backward compatibility (local-only cart)
    addToCart: (state, action: PayloadAction<Part>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
        state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
    },
    // New reducers for API-managed cart
    setCartItems: (state, action: PayloadAction<{ items: CartItem[]; summary: CartSummary }>) => {
      state.items = action.payload.items
      state.total = action.payload.summary.totalAmount || 0
      state.lastSyncAt = new Date().toISOString()
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    // Update a specific cart item (used after API updates)
    updateCartItem: (state, action: PayloadAction<{ cartItemId: string; quantity: number; totalPrice: number }>) => {
      const item = state.items.find((item) => item.cartItemId === action.payload.cartItemId)
      if (item) {
        item.quantity = action.payload.quantity
        state.total = state.items.reduce((sum, item) => sum + (item.cartItemId ? item.price * item.quantity : item.price * item.quantity), 0)
      }
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItems, setCartLoading, updateCartItem } = cartSlice.actions
export default cartSlice.reducer
