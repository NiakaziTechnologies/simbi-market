"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { DollarSign, Banknote, CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLoan } from "@/lib/hooks/use-loan"


interface LoanCardProps {
  type: 'buyer' | 'seller'
}

export function LoanCard({ type }: LoanCardProps) {
  const { score, loading } = useLoan(type)
  const mockLimit = score > 80 ? 50000 : score > 60 ? 25000 : 10000

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-2" />
        <div className="h-8 bg-muted rounded w-32 mb-4" />
        <div className="h-2 bg-muted rounded-full w-full mb-4" />
        <div className="h-10 bg-muted rounded-lg w-24" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 border border-accent/20 hover:border-accent/40 transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-foreground mb-1">Instant Loans</h3>
          <p className="text-sm text-muted-foreground">{type === 'buyer' ? 'Buy now, pay later' : 'Reorder stock instantly'}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Eligibility Score</span>
          <span className="font-medium text-accent">{score}%</span>
        </div>
        <Progress value={score} className="h-2 [&>div]:bg-accent" />
        <div className="text-xs text-muted-foreground">
          Up to ${mockLimit.toLocaleString()}
        </div>
      </div>

      <Link href={`/dashboard/${type}/loans`}>
        <Button className="w-full group-hover:shadow-lg transition-shadow bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-white">
          Apply Now
          <ShieldCheck className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  )
}

