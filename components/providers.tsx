"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { CartLoader } from "@/components/cart-loader"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          <CartLoader />
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}
