import { configureStore } from "@reduxjs/toolkit"
import partsReducer from "./features/parts-slice"
import cartReducer from "./features/cart-slice"
import loanReducer from "./features/loan-slice"

export const store = configureStore({
  reducer: {
    parts: partsReducer,
    cart: cartReducer,
    loan: loanReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
