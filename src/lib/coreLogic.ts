export type PaymentStatusFilter = 'all' | 'unpaid' | 'paid'
export type InterestPeriod = 'year' | 'month' | 'week'

export type SettlementLite = {
  totalPaid: number
  paidAt: string | null
}

export type SettlementWithDateLite = SettlementLite & {
  createdAt: string
  withdrawnAmount?: number
}

export function shouldLockLogin(attempts: number, maxAttempts: number): boolean {
  return attempts >= maxAttempts
}

export function calculateNetPoints(
  bonusPoints: number,
  penaltyPoints: number,
  penaltyEnabled: boolean,
): number {
  return penaltyEnabled ? bonusPoints - penaltyPoints : bonusPoints
}

export function calculatePeriodPayout(basePaid: number, extraPaid: number): number {
  return Math.max(0, basePaid) + Math.max(0, extraPaid)
}

export function filterSettlementsByPaymentStatus(
  settlements: SettlementLite[],
  status: PaymentStatusFilter,
): SettlementLite[] {
  if (status === 'all') {
    return settlements
  }
  if (status === 'paid') {
    return settlements.filter((item) => Boolean(item.paidAt))
  }
  return settlements.filter((item) => !item.paidAt)
}

export function getUnpaidTotal(settlements: SettlementLite[]): number {
  return settlements
    .filter((settlement) => !settlement.paidAt)
    .reduce((sum, settlement) => sum + settlement.totalPaid, 0)
}

function getElapsedPeriods(fromIso: string, toDate: Date, interestPeriod: InterestPeriod): number {
  const from = new Date(fromIso)
  if (Number.isNaN(from.getTime()) || from >= toDate) {
    return 0
  }

  if (interestPeriod === 'week') {
    const diffMs = toDate.getTime() - from.getTime()
    return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
  }

  if (interestPeriod === 'month') {
    let months = (toDate.getFullYear() - from.getFullYear()) * 12
    months += toDate.getMonth() - from.getMonth()
    if (toDate.getDate() < from.getDate()) {
      months -= 1
    }
    return Math.max(0, months)
  }

  let years = toDate.getFullYear() - from.getFullYear()
  if (
    toDate.getMonth() < from.getMonth() ||
    (toDate.getMonth() === from.getMonth() && toDate.getDate() < from.getDate())
  ) {
    years -= 1
  }
  return Math.max(0, years)
}

export function calculateUnpaidTotalWithInterest(
  settlements: SettlementWithDateLite[],
  ratePct: number,
  interestPeriod: InterestPeriod,
  asOf = new Date(),
): { principal: number; interest: number; totalWithInterest: number } {
  const sanitizedRate = Math.max(0, ratePct) / 100

  const getOutstanding = (settlement: SettlementWithDateLite): number => {
    const withdrawn = Math.max(0, settlement.withdrawnAmount ?? 0)
    const effectiveWithdrawn = settlement.paidAt && settlement.withdrawnAmount === undefined
      ? Math.max(0, settlement.totalPaid)
      : withdrawn
    return Math.max(0, Math.max(0, settlement.totalPaid) - effectiveWithdrawn)
  }

  const principal = settlements
    .reduce((sum, settlement) => sum + getOutstanding(settlement), 0)

  if (sanitizedRate === 0) {
    return {
      principal,
      interest: 0,
      totalWithInterest: principal,
    }
  }

  const totalWithInterest = settlements
    .reduce((sum, settlement) => {
      const amount = getOutstanding(settlement)
      if (amount === 0) {
        return sum
      }
      const elapsedPeriods = getElapsedPeriods(settlement.createdAt, asOf, interestPeriod)
      return sum + amount * Math.pow(1 + sanitizedRate, elapsedPeriods)
    }, 0)

  const roundedTotal = Math.round(totalWithInterest)
  const roundedInterest = Math.round(roundedTotal - principal)

  return {
    principal,
    interest: Math.max(0, roundedInterest),
    totalWithInterest: roundedTotal,
  }
}
