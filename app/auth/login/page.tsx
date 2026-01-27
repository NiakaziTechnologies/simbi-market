"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/auth-context'
import { Loader2, AlertCircle, Lock, Mail, Clock } from 'lucide-react'
import Link from 'next/link'
import type { ApiError } from '@/lib/api/api-client'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface ErrorInfo {
  message: string
  type: 'error' | 'warning' | 'info'
  icon?: React.ReactNode
  action?: {
    label: string
    href: string
  }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: setAuthUser, isAuthenticated, role } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  
  const returnUrl = searchParams?.get('returnUrl') || null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl))
      } else if (role === 'buyer') {
        router.push('/dashboard/buyer')
      } else if (role === 'seller') {
        router.push('/dashboard/seller')
      } else if (role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, role, router, returnUrl])

  /**
   * Extract remaining minutes from error message
   */
  const extractRemainingMinutes = (message: string): number | null => {
    const match = message.match(/(\d+)\s+minute/)
    return match ? parseInt(match[1], 10) : null
  }

  /**
   * Parse error message and determine error type and styling
   */
  const parseError = (error: ApiError | Error): ErrorInfo => {
    const message = error.message || 'An unexpected error occurred'
    const lowerMessage = message.toLowerCase()

    // Account locked
    if (lowerMessage.includes('locked') || lowerMessage.includes('lockout')) {
      const minutes = extractRemainingMinutes(message)
      return {
        message: minutes 
          ? `Account locked. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
          : message,
        type: 'warning',
        icon: <Lock className="h-5 w-5" />,
      }
    }

    // IP rate limit
    if (lowerMessage.includes('device') || lowerMessage.includes('too many login attempts')) {
      const minutes = extractRemainingMinutes(message)
      return {
        message: minutes
          ? `Too many login attempts from this device. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
          : message,
        type: 'warning',
        icon: <Clock className="h-5 w-5" />,
      }
    }

    // Email verification required
    if (lowerMessage.includes('verify') || lowerMessage.includes('verification')) {
      return {
        message: message,
        type: 'info',
        icon: <Mail className="h-5 w-5" />,
        action: {
          label: 'Resend verification email',
          href: '/auth/verify-email',
        },
      }
    }

    // Account status issues (inactive, suspended, banned)
    if (lowerMessage.includes('inactive') || lowerMessage.includes('suspended') || lowerMessage.includes('banned') || lowerMessage.includes('pending')) {
      return {
        message: message,
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5" />,
      }
    }

    // Invalid credentials (wrong password attempts)
    if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('attempts remaining')) {
      return {
        message: message,
        type: 'error',
        icon: <AlertCircle className="h-5 w-5" />,
      }
    }

    // Generic error
    return {
      message: message,
      type: 'error',
      icon: <AlertCircle className="h-5 w-5" />,
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setErrorInfo(null)

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      })

      // Set user in auth context
      setAuthUser(response.user)

      // Redirect based on userType/role from response
      const userType = response.user.role // This is mapped from userType in the API
      const redirectPath = returnUrl 
        ? decodeURIComponent(returnUrl)
        : userType === 'buyer'
        ? '/dashboard/buyer'
        : userType === 'seller'
        ? '/dashboard/seller'
        : userType === 'admin'
        ? '/dashboard/admin'
        : '/dashboard'

      router.push(redirectPath)
    } catch (err: any) {
      // Parse the error to get appropriate styling and icon
      const parsedError = parseError(err)
      setErrorInfo(parsedError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-xl p-8 border border-border">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground inline-block">
              SIMBI<span className="text-accent">.</span>
            </Link>
            <h1 className="text-3xl font-light text-foreground mt-4 mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-light">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {errorInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                errorInfo.type === 'error'
                  ? 'bg-destructive/10 border border-destructive/20'
                  : errorInfo.type === 'warning'
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-blue-500/10 border border-blue-500/20'
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  errorInfo.type === 'error'
                    ? 'text-destructive'
                    : errorInfo.type === 'warning'
                    ? 'text-yellow-500'
                    : 'text-blue-500'
                }`}
              >
                {errorInfo.icon}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    errorInfo.type === 'error'
                      ? 'text-destructive'
                      : errorInfo.type === 'warning'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`}
                >
                  {errorInfo.message}
                </p>
                {errorInfo.action && (
                  <Link
                    href={errorInfo.action.href}
                    className="text-sm text-accent hover:underline mt-2 inline-block"
                  >
                    {errorInfo.action.label} →
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-muted/50 border-border"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-muted/50 border-border"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
            <p>
              <Link href="/auth/forgot-password" className="text-accent hover:underline">
                Forgot password?
              </Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-accent hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
