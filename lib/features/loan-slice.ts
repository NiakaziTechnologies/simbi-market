import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface LoanBank {
  id: string
  name: string
  logo: string
  interestRate: number
  minAmount: number
  maxAmount: number
}

export interface LoanApplication {
  id: string
  type: 'buyer' | 'seller'
  status: 'pending' | 'approved' | 'rejected'
  bank: LoanBank
  amount: number
  termMonths: number
  reason: string
  appliedAt: string
  approvedAmount?: number
  approvedAt?: string | null
  rejectionReason?: string
}

interface LoanState {
  banks: LoanBank[]
  applications: LoanApplication[]
  eligibilityScore: number // 0-100 mock loyalty/financial score
  loading: boolean
  applying: boolean
}

const banks: LoanBank[] = [
  {
    id: "zb",
    name: "ZB Bank",
    logo: "/banks/zb-bank.png",
    interestRate: 12.5,
    minAmount: 500,
    maxAmount: 50000,
  },
  {
    id: "cbz",
    name: "CBZ Bank",
    logo: "/banks/cbz-bank.png",
    interestRate: 11.8,
    minAmount: 1000,
    maxAmount: 75000,
  },
  {
    id: "cabs",
    name: "CABS",
    logo: "/banks/cabs.png",
    interestRate: 13.2,
    minAmount: 250,
    maxAmount: 30000,
  },
]

const initialState: LoanState = {
  banks,
  applications: [],
  eligibilityScore: 78, // Mock 78% based on loyalty/purchases
  loading: false,
  applying: false,
}

const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setEligibilityScore: (state, action: PayloadAction<number>) => {
      state.eligibilityScore = action.payload
    },
    applyLoanStart: (state) => {
      state.applying = true
    },
    applyLoanSuccess: (state, action: PayloadAction<LoanApplication>) => {
      state.applying = false
      state.applications.unshift(action.payload)
    },
    applyLoanFailure: (state) => {
      state.applying = false
    },
    fetchLoansSuccess: (state, action: PayloadAction<LoanApplication[]>) => {
      state.applications = action.payload
    },
  },
})

export const { 
  setLoading, 
  setEligibilityScore,
  applyLoanStart,
  applyLoanSuccess,
  applyLoanFailure,
  fetchLoansSuccess 
} = loanSlice.actions

export default loanSlice.reducer

