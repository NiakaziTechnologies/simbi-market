"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function AdminForbiddenToast() {
  const { toast } = useToast()

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail
      toast({
        title: "Access denied",
        description: detail?.message || "You don't have permission.",
        variant: "destructive",
      })
    }
    window.addEventListener("api:forbidden", handler)
    return () => window.removeEventListener("api:forbidden", handler)
  }, [toast])

  return null
}
