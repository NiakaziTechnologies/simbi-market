"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { forgotPassword } from '@/lib/api/auth-password'
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await forgotPassword({
        email: data.email,
      })
      setIsSuccess(true)
    } catch (err: any) {
      // Even if there's an error, show success message for security
      // This prevents email enumeration attacks
      setIsSuccess(true)
      console.error('Password reset request error:', err)
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
        <Card className="glass-card border-border">
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground inline-block mb-4">
              SIMBI<span className="text-accent">.</span>
            </Link>
            <CardTitle className="text-3xl font-light">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
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
                  <h3 className="text-xl font-light mb-2">Check Your Email</h3>
                  <p className="text-muted-foreground text-sm">
                    If an account exists with this email, a password reset link has been sent.
                    Please check your email inbox and follow the instructions.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setIsSuccess(false)
                      setError(null)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/auth/login" className="text-accent hover:underline">
                    ← Back to Login
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
