"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPassword } from '@/lib/api/auth-password'
import { Loader2, Lock, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Extract token and type from URL parameters
  useEffect(() => {
    const tokenParam = searchParams?.get('token')
    const typeParam = searchParams?.get('type')

    if (!tokenParam) {
      setTokenError('Invalid reset link. Missing token.')
      return
    }

    setToken(tokenParam)
    
    // Extract user type from URL if provided
    if (typeParam) {
      setUserType(typeParam)
    }
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Extract type from URL or use from state
      const typeFromUrl = searchParams?.get('type')
      const finalUserType = userType || typeFromUrl
      
      await resetPassword({
        token,
        newPassword: data.newPassword,
        userType: finalUserType as "buyer" | "seller" | "staff" | "admin" | undefined,
      })
      setIsSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password'
      setError(errorMessage)
      
      // If token is invalid or expired, show specific message
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('expired')) {
        setTokenError('This reset link has expired or is invalid. Please request a new password reset link.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show error if token is missing
  if (tokenError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-border">
            <CardHeader className="text-center">
              <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground inline-block mb-4">
                SIMBI<span className="text-accent">.</span>
              </Link>
              <CardTitle className="text-2xl font-light">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-muted-foreground mb-6">{tokenError}</p>
              </div>
              <Link href="/auth/forgot-password">
                <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-border">
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground inline-block mb-4">
              SIMBI<span className="text-accent">.</span>
            </Link>
            <CardTitle className="text-3xl font-light">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-light mb-2">Password Reset Successful!</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your password has been reset successfully. You can now login with your new password.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to login page...
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                    Go to Login
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive">{error}</p>
                      {error.toLowerCase().includes('token') || error.toLowerCase().includes('expired') ? (
                        <Link href="/auth/forgot-password" className="text-sm text-accent hover:underline mt-2 inline-block">
                          Request a new reset link →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min 8 characters)"
                      className="bg-muted/50 border-border pr-10"
                      {...register('newPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="bg-muted/50 border-border pr-10"
                      {...register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  disabled={isLoading || !token}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/auth/login" className="text-accent hover:underline">
                    <ArrowLeft className="h-4 w-4 inline mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="glass-card border-border">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
