import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchLoansSuccess, setEligibilityScore, setLoading } from "@/lib/features/loan-slice"
import { fetchLoansAsync, getEligibilityScoreAsync } from "@/lib/api/loans"

export function useLoan(type: 'buyer' | 'seller') {
  const dispatch = useDispatch<AppDispatch>()
  const { eligibilityScore, loading, applications } = useSelector((state: RootState) => state.loan)
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    async function loadLoanData() {
      try {
        dispatch(setLoading(true))
        const scorePromise = dispatch(getEligibilityScoreAsync(type))
        const loansPromise = dispatch(fetchLoansAsync(type))
        const [score, loans] = await Promise.all([
          scorePromise.unwrap(),
          loansPromise.unwrap()
        ])
        dispatch(setEligibilityScore(score))
        dispatch(fetchLoansSuccess(loans))
      } catch (error) {
        console.error('Failed to load loan data:', error)
      } finally {
        dispatch(setLoading(false))
        setLocalLoading(false)
      }
    }

    loadLoanData()
  }, [dispatch, type])

  return {
    score: eligibilityScore,
    loading: localLoading || loading,
    applications,
  }
}
