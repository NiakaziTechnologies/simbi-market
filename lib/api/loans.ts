import { createAsyncThunk } from "@reduxjs/toolkit"
import type { LoanApplication, LoanBank } from "@/lib/features/loan-slice"
import { delay } from "@/lib/utils"

// Mock banks
export const banks: LoanBank[] = [
  {
    id: "zb",
    name: "ZB Bank",
    logo: "https://www.zb.co.zw/sites/default/files/zblogo.png",
    interestRate: 12.5,
    minAmount: 500,
    maxAmount: 50000,
  },
  {
    id: "cbz",
    name: "CBZ Bank",
    logo: "https://scontent-jnb2-1.xx.fbcdn.net/v/t39.30808-1/348247466_236891238982731_2244404912065337579_n.jpg?stp=cp0_dst-jpg_s40x40_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=5cjmyfQAnI4Q7kNvwFg7gyj&_nc_oc=AdrKSWm2sqG75_N2aSRK_VUpLEXBM2t0NhCifqBczr6XRtPwVPB8N_5rfoTLSPsbEyrL8bSCw1SO4QLyFYzJ9alA&_nc_zt=24&_nc_ht=scontent-jnb2-1.xx&_nc_gid=4Xnl-a8Ux5PHgipVD_g_dw&_nc_ss=7a32e&oh=00_Afx-jSICEJRa_3JBmF6JjbtQxCN_kOMx7l3m1pLy8Ij4wg&oe=69C9D11F",
    interestRate: 11.8,
    minAmount: 1000,
    maxAmount: 75000,
  },
  {
    id: "cabs",
    name: "CABS",
    logo: "http://www.cabs.co.zw/sites/default/files/logo.png",
    interestRate: 13.2,
    minAmount: 250,
    maxAmount: 30000,
  },
]

// Async thunks
export const fetchLoansAsync = createAsyncThunk(
  'loan/fetchLoans',
  async (type: 'buyer' | 'seller') => {
    await delay(1000)
    // Mock
    return [
      {
        id: "loan-001",
        type,
        status: "approved" as const,
        bank: banks[0],
        amount: 25000,
        termMonths: 24,
        reason: type === 'buyer' ? "Car parts purchase" : "Inventory reorder",
        appliedAt: "2024-10-15T10:30:00Z",
        approvedAmount: 25000,
        approvedAt: "2024-10-15T11:15:00Z",
      },
      {
        id: "loan-002",
        type,
        status: "rejected" as const,
        bank: banks[1],
        amount: 15000,
        termMonths: 12,
        reason: type === 'buyer' ? "Repair parts" : "Stock replenishment",
        appliedAt: "2024-10-10T14:20:00Z",
        rejectionReason: "Insufficient sales volume for requested amount"
      },
      {
        id: "loan-003",
        type,
        status: "pending" as const,
        bank: banks[2],
        amount: 35000,
        termMonths: 18,
        reason: type === 'buyer' ? "Workshop expansion" : "New inventory line",
        appliedAt: "2024-10-20T09:45:00Z",
      }
    ]
  }
)

export const getEligibilityScoreAsync = createAsyncThunk(
  'loan/getEligibilityScore',
  async (type: 'buyer' | 'seller') => {
    await delay(800)
    const scores = { buyer: 78, seller: 85 }
    return scores[type]
  }
)

export const applyForLoanAsync = createAsyncThunk(
  'loan/applyForLoan',
  async ({ type, data }: { type: 'buyer' | 'seller'; data: { bankId: string, amount: number, termMonths: number, reason: string } }) => {
    await delay(2000)
    const bank = banks.find(b => b.id === data.bankId)
    if (!bank || data.amount > bank.maxAmount || data.amount < bank.minAmount) {
      throw new Error("Invalid loan request")
    }

    const score = type === 'buyer' ? 78 : 85
    const approvedAmount = score > 80 ? data.amount : Math.floor(data.amount * 0.8)

    const application: LoanApplication = {
      id: `loan-${Date.now()}`,
      type,
      status: score > 75 ? 'approved' : 'rejected',
      bank: bank!,
      amount: data.amount,
      termMonths: data.termMonths,
      reason: data.reason,
      appliedAt: new Date().toISOString(),
      ...(score > 75 && { approvedAmount, approvedAt: new Date().toISOString() }),
      ...(score < 75 && { rejectionReason: "Insufficient eligibility score" }),
    }

    return application
  }
)

