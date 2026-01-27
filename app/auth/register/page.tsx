"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  registerUser,
  verifyBuyerEmail,
  verifySellerEmail,
  resendBuyerVerification,
  resendSellerVerification,
  type RegisterBuyerCommercialRequest,
  type RegisterSellerRequest,
} from '@/lib/api/auth-register'
import { useAuth } from '@/lib/auth/auth-context'
import { setAuthToken, setUser } from '@/lib/auth/auth-utils'
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

// Buyer Commercial Schema
const buyerCommercialSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  companyName: z.string().min(1, 'Company name is required'),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  creditLimit: z.number().optional(),
  paymentTermDays: z.number().optional(),
  currency: z.string().optional(),
  monthlySpendingLimit: z.number().optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  numberOfEmployees: z.number().optional(),
  establishedYear: z.number().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  marketingConsent: z.boolean().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

// Seller Schema
const sellerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  tradingName: z.string().optional(),
  businessAddress: z.string().min(1, 'Business address is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  tin: z.string().min(1, 'TIN is required'),
  registrationNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
})

type BuyerCommercialFormData = z.infer<typeof buyerCommercialSchema>
type SellerFormData = z.infer<typeof sellerSchema>

type RegistrationStep = 'type' | 'form' | 'verification'
type UserType = 'buyer' | 'seller'

export default function RegisterPage() {
  const router = useRouter()
  const { login: setAuthUser } = useAuth()
  const [step, setStep] = useState<RegistrationStep>('type')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Buyer Commercial Form
  const buyerCommercialForm = useForm<BuyerCommercialFormData>({
    resolver: zodResolver(buyerCommercialSchema),
    defaultValues: {
      termsAccepted: false,
      marketingConsent: false,
    },
  })

  // Seller Form
  const sellerForm = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
  })

  const handleBuyerCommercialSubmit = async (data: BuyerCommercialFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const request: RegisterBuyerCommercialRequest = {
        userType: 'buyer',
        buyerType: 'COMMERCIAL', // Always COMMERCIAL by default
        ...data,
      }
      const response = await registerUser(request)
      setRegisteredEmail(data.email)
      setStep('verification')
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSellerSubmit = async (data: SellerFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const request: RegisterSellerRequest = {
        userType: 'seller',
        ...data,
      }
      const response = await registerUser(request)
      setRegisteredEmail(data.email)
      setStep('verification')
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      if (userType === 'buyer') {
        const response = await verifyBuyerEmail({
          email: registeredEmail,
          code: verificationCode,
        })
        
        // Map buyer data to User format
        if (response.buyer) {
          const user = {
            id: response.buyer.id || '',
            email: response.buyer.email || registeredEmail,
            name: response.buyer.firstName && response.buyer.lastName
              ? `${response.buyer.firstName} ${response.buyer.lastName}`
              : registeredEmail.split('@')[0],
            role: 'buyer' as const,
          }
          
          // Store token and user
          setAuthToken(response.accessToken)
          setUser(user)
          setAuthUser(user)
        }
        
        router.push('/dashboard/buyer')
      } else {
        const response = await verifySellerEmail({
          email: registeredEmail,
          code: verificationCode,
        })
        
        // Map seller data to User format
        if (response.seller) {
          const user = {
            id: response.seller.id || '',
            email: response.seller.email || registeredEmail,
            name: response.seller.businessName || registeredEmail.split('@')[0],
            role: 'seller' as const,
          }
          
          // Store token and user
          setAuthToken(response.accessToken)
          setUser(user)
          setAuthUser(user)
        }
        
        router.push('/dashboard/seller')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError(null)

    try {
      if (userType === 'buyer') {
        await resendBuyerVerification({ email: registeredEmail })
      } else {
        await resendSellerVerification({ email: registeredEmail })
      }
      setError(null)
      // Show success message
      alert('Verification code sent! Please check your email.')
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card border-border">
          <CardHeader className="text-center">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground inline-block mb-4">
              SIMBI<span className="text-accent">.</span>
            </Link>
            <CardTitle className="text-3xl font-light">Create Account</CardTitle>
            <CardDescription>Join SIMBI marketplace as a buyer or seller</CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {/* Step 1: User Type Selection */}
              {step === 'type' && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-accent/10 hover:border-accent"
                      onClick={() => {
                        setUserType('buyer')
                        setStep('form')
                      }}
                    >
                      <div className="text-4xl">🛒</div>
                      <div className="text-lg font-medium">Buyer</div>
                      <div className="text-sm text-muted-foreground">Shop for parts</div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-accent/10 hover:border-accent"
                      onClick={() => {
                        setUserType('seller')
                        setStep('form')
                      }}
                    >
                      <div className="text-4xl">🏪</div>
                      <div className="text-lg font-medium">Seller</div>
                      <div className="text-sm text-muted-foreground">Sell your products</div>
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      Already have an account?{' '}
                      <Link href="/auth/login" className="text-accent hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Registration Form */}
              {step === 'form' && userType && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep('type')
                      setUserType(null)
                      setError(null)
                    }}
                    className="mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {userType === 'buyer' && (
                    <form onSubmit={buyerCommercialForm.handleSubmit(handleBuyerCommercialSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            {...buyerCommercialForm.register('firstName')}
                            className="bg-muted/50 border-border"
                          />
                          {buyerCommercialForm.formState.errors.firstName && (
                            <p className="text-sm text-destructive">
                              {buyerCommercialForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            {...buyerCommercialForm.register('lastName')}
                            className="bg-muted/50 border-border"
                          />
                          {buyerCommercialForm.formState.errors.lastName && (
                            <p className="text-sm text-destructive">
                              {buyerCommercialForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...buyerCommercialForm.register('email')}
                          className="bg-muted/50 border-border"
                        />
                        {buyerCommercialForm.formState.errors.email && (
                          <p className="text-sm text-destructive">
                            {buyerCommercialForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          {...buyerCommercialForm.register('password')}
                          className="bg-muted/50 border-border"
                        />
                        {buyerCommercialForm.formState.errors.password && (
                          <p className="text-sm text-destructive">
                            {buyerCommercialForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          {...buyerCommercialForm.register('companyName')}
                          className="bg-muted/50 border-border"
                        />
                        {buyerCommercialForm.formState.errors.companyName && (
                          <p className="text-sm text-destructive">
                            {buyerCommercialForm.formState.errors.companyName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          {...buyerCommercialForm.register('phoneNumber')}
                          className="bg-muted/50 border-border"
                        />
                        {buyerCommercialForm.formState.errors.phoneNumber && (
                          <p className="text-sm text-destructive">
                            {buyerCommercialForm.formState.errors.phoneNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Registration Number</Label>
                          <Input
                            id="registrationNumber"
                            {...buyerCommercialForm.register('registrationNumber')}
                            className="bg-muted/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxId">Tax ID</Label>
                          <Input
                            id="taxId"
                            {...buyerCommercialForm.register('taxId')}
                            className="bg-muted/50 border-border"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          {...buyerCommercialForm.register('termsAccepted')}
                          className="rounded border-border"
                        />
                        <Label htmlFor="termsAccepted" className="text-sm">
                          I accept the terms and conditions *
                        </Label>
                      </div>
                      {buyerCommercialForm.formState.errors.termsAccepted && (
                        <p className="text-sm text-destructive">
                          {buyerCommercialForm.formState.errors.termsAccepted.message}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  )}

                  {userType === 'seller' && (
                    <form onSubmit={sellerForm.handleSubmit(handleSellerSubmit)} className="space-y-4">
                      {error && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          {...sellerForm.register('businessName')}
                          className="bg-muted/50 border-border"
                        />
                        {sellerForm.formState.errors.businessName && (
                          <p className="text-sm text-destructive">
                            {sellerForm.formState.errors.businessName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tradingName">Trading Name</Label>
                        <Input
                          id="tradingName"
                          {...sellerForm.register('tradingName')}
                          className="bg-muted/50 border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seller-email">Email *</Label>
                        <Input
                          id="seller-email"
                          type="email"
                          {...sellerForm.register('email')}
                          className="bg-muted/50 border-border"
                        />
                        {sellerForm.formState.errors.email && (
                          <p className="text-sm text-destructive">
                            {sellerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seller-password">Password *</Label>
                        <Input
                          id="seller-password"
                          type="password"
                          {...sellerForm.register('password')}
                          className="bg-muted/50 border-border"
                        />
                        {sellerForm.formState.errors.password && (
                          <p className="text-sm text-destructive">
                            {sellerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessAddress">Business Address *</Label>
                        <Input
                          id="businessAddress"
                          {...sellerForm.register('businessAddress')}
                          className="bg-muted/50 border-border"
                        />
                        {sellerForm.formState.errors.businessAddress && (
                          <p className="text-sm text-destructive">
                            {sellerForm.formState.errors.businessAddress.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number *</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          {...sellerForm.register('contactNumber')}
                          className="bg-muted/50 border-border"
                        />
                        {sellerForm.formState.errors.contactNumber && (
                          <p className="text-sm text-destructive">
                            {sellerForm.formState.errors.contactNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tin">Tax Identification Number (TIN) *</Label>
                        <Input
                          id="tin"
                          {...sellerForm.register('tin')}
                          className="bg-muted/50 border-border"
                        />
                        {sellerForm.formState.errors.tin && (
                          <p className="text-sm text-destructive">
                            {sellerForm.formState.errors.tin.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          {...sellerForm.register('registrationNumber')}
                          className="bg-muted/50 border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankAccountName">Bank Account Name</Label>
                        <Input
                          id="bankAccountName"
                          {...sellerForm.register('bankAccountName')}
                          className="bg-muted/50 border-border"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                          <Input
                            id="bankAccountNumber"
                            {...sellerForm.register('bankAccountNumber')}
                            className="bg-muted/50 border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            {...sellerForm.register('bankName')}
                            className="bg-muted/50 border-border"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  )}
                </motion.div>
              )}

              {/* Step 3: Email Verification */}
              {step === 'verification' && (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-light mb-2">Verify Your Email</h3>
                    <p className="text-muted-foreground">
                      We've sent a 6-digit verification code to
                      <br />
                      <span className="font-medium text-foreground">{registeredEmail}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={(value) => {
                          setVerificationCode(value)
                          setError(null)
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleVerifyEmail}
                      className="w-full bg-accent hover:bg-accent/90 text-white"
                      disabled={isVerifying || verificationCode.length !== 6}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify Email
                        </>
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the code?
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-accent"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
