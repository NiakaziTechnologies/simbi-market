"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Banknote, CreditCard, Shield, Calculator, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { applyLoanStart, applyLoanSuccess, applyLoanFailure } from "@/lib/features/loan-slice"
import { applyForLoanAsync, banks } from "@/lib/api/loans"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LoanFormProps {
  type: 'buyer' | 'seller'
  score: number
}

export function LoanForm({ type, score }: LoanFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [bankId, setBankId] = useState("zb")
  const [amount, setAmount] = useState("")
  const [termMonths, setTermMonths] = useState("12")
  const [reason, setReason] = useState(type === 'buyer' ? "Car parts purchase" : "Inventory reorder")
  const [submitting, setSubmitting] = useState(false)
  const [monthlyPayment, setMonthlyPayment] = useState(0)

  const selectedBank = banks.find(b => b.id === bankId)

  // Calculate monthly payment preview
  const calculateMonthlyPayment = () => {
    if (!amount || !selectedBank || !termMonths) return 0
    const principal = parseFloat(amount)
    const rate = selectedBank.interestRate / 100 / 12 // Monthly rate
    const months = parseInt(termMonths)
    const payment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    setMonthlyPayment(Math.round(payment))
  }

  useEffect(() => {
    calculateMonthlyPayment()
  }, [amount, termMonths, bankId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) < 250 || parseFloat(amount) > 75000) {
      toast.error("Amount must be between $250 and $75,000")
      return
    }

    setSubmitting(true)
    dispatch(applyLoanStart())

    try {
      const data = {
        bankId,
        amount: parseFloat(amount),
        termMonths: parseInt(termMonths),
        reason,
      }
      const application = await dispatch(applyForLoanAsync({ type, data })).unwrap()
      dispatch(applyLoanSuccess(application))
      toast.success(`Loan application submitted! Approval in ~24 hours.`)
      router.push(`/dashboard/${type}/loans`)
    } catch (error) {
      dispatch(applyLoanFailure())
      toast.error(error instanceof Error ? error.message : "Application failed")
    } finally {
      setSubmitting(false)
    }
  }

  const maxLoan = score > 80 ? 75000 : score > 60 ? 50000 : 25000
  const minLoan = 250

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 mb-8 sm:mb-12 shadow-2xl border border-accent/20 bg-gradient-to-br from-background/80 via-background to-accent/5"
      >
        <div className="text-center mb-6 sm:mb-10">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl border-4 border-white/20">
            <Banknote className="h-8 w-8 sm:h-12 sm:w-12 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text mb-3 sm:mb-4">
            {type === 'buyer' ? 'Personal Loan Application' : 'Business Loan Application'}
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {type === 'buyer'
              ? 'Get instant financing for your auto parts purchases. Pre-approval in seconds.'
              : 'Secure financing tailored for automotive parts sellers. Instant eligibility based on your sales performance and business history.'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Form */}
          <div className="space-y-5 sm:space-y-8">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-sm sm:text-lg font-medium">Select Bank</Label>
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger className="ring-2 ring-muted/50 focus-within:ring-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full border-2 border-muted/50">
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id} className="p-3 sm:p-4 hover:bg-accent/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl p-1 bg-gradient-to-br from-accent/10 border flex items-center justify-center">
                          <img src={bank.logo} alt={bank.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm sm:text-base">{bank.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Min: ${bank.minAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm sm:text-lg font-medium flex items-center gap-2 mb-2 sm:mb-3">
                Loan Amount
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-accent/10 text-accent">
                  Up to ${maxLoan.toLocaleString()}
                </Badge>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter loan amount"
                  className="pl-10 sm:pl-12 pr-4 text-lg sm:text-2xl font-semibold h-12 sm:h-16 bg-gradient-to-r from-muted/50"
                  min={minLoan}
                  max={maxLoan}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label className="text-sm sm:text-lg font-medium flex items-center gap-2 mb-2 sm:mb-3">
                  Term Length
                </Label>
                <Select value={termMonths} onValueChange={setTermMonths}>
                  <SelectTrigger className="ring-2 ring-muted/50 focus-within:ring-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        6 months
                      </div>
                    </SelectItem>
                    <SelectItem value="12">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        12 months
                      </div>
                    </SelectItem>
                    <SelectItem value="24">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        24 months
                      </div>
                    </SelectItem>
                    <SelectItem value="36">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        36 months
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm sm:text-lg font-medium flex items-center gap-2 mb-2 sm:mb-3">
                  Purpose
                </Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Inventory reorder, workshop expansion"
                  className="ring-2 ring-muted/50 focus-within:ring-accent h-10 sm:h-14 text-sm sm:text-lg"
                />
              </div>
            </div>

            {/* Monthly Payment Preview */}
            {monthlyPayment > 0 && selectedBank && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-500/5 to-green-500/2 border border-green-500/20 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-lg text-foreground">Monthly Repayment</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {selectedBank.name} • {termMonths} months • {selectedBank.interestRate}%
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent drop-shadow-lg">
                      ${monthlyPayment.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={submitting || !amount || !selectedBank}
              className="w-full h-12 sm:h-16 text-base sm:text-xl font-semibold bg-gradient-to-r from-accent to-accent/90 hover:from-accent/95 hover:to-accent text-white shadow-2xl hover:shadow-accent/50 transition-all group"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 sm:mr-4 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                  Get Instant Pre-Approval
                </>
              )}
            </Button>
          </div>

          {/* Eligibility & Bank Comparison */}
          <div className="space-y-6 sm:space-y-8 lg:sticky lg:top-24 lg:h-fit lg:pt-4">
            {/* Eligibility */}
            <Card className="glass-card border-accent/30 shadow-xl">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  <CardTitle className="text-base sm:text-xl font-light">Eligibility Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Score</span>
                    <Badge className="text-lg sm:text-2xl h-9 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-accent to-accent/80 text-white font-bold shadow-lg">
                      {score}%
                    </Badge>
                  </div>
                  <Progress value={score} className="h-2 sm:h-3 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-accent/70 shadow-md" />
                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                    <div className="text-muted-foreground">Poor</div>
                    <div className="text-right text-accent font-medium">Excellent</div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <div>• Score {score}% qualifies for {score > 80 ? 'Premium' : score > 60 ? 'Standard' : 'Basic'} rates</div>
                  <div>• Max loan amount: ${maxLoan.toLocaleString()}</div>
                  <div>• Approval odds: {score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Fair'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Bank Comparison */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg font-light flex items-center gap-2">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bank Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-0">
                {banks.map((bank, index) => (
                  <motion.div
                    key={bank.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group cursor-pointer p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 hover:border-accent/50 ${
                      bankId === bank.id ? 'border-accent/50 bg-accent/5 shadow-lg ring-2 ring-accent/30' : 'border-border/50 hover:border-accent/30'
                    }`}
                    onClick={() => setBankId(bank.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 bg-gradient-to-br from-muted to-muted/50 group-hover:from-accent/20 border flex items-center justify-center group-hover:scale-105 transition-all flex-shrink-0">
                          <img src={bank.logo} alt={bank.name} className="w-6 h-6 sm:w-9 sm:h-9 object-contain" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">{bank.name}</h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{type === 'seller' ? 'Business' : 'Personal'} Rates</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className={`text-lg sm:text-2xl font-bold ${
                          bankId === bank.id ? 'bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent' : 'text-accent'
                        }`}>
                          {bank.interestRate}%
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">APR</div>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50 text-[10px] sm:text-xs text-muted-foreground grid grid-cols-2 gap-2 sm:gap-4">
                      <div>Min ${bank.minAmount.toLocaleString()}</div>
                      <div>Max ${bank.maxAmount.toLocaleString()}</div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

