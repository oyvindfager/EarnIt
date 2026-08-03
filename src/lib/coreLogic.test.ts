import { describe, expect, it } from 'vitest'
import {
  calculateUnpaidTotalWithInterest,
  calculateNetPoints,
  calculatePeriodPayout,
  filterSettlementsByPaymentStatus,
  getUnpaidTotal,
  shouldLockLogin,
} from './coreLogic'

describe('core logic', () => {
  it('locks login after max attempts', () => {
    expect(shouldLockLogin(5, 5)).toBe(true)
    expect(shouldLockLogin(4, 5)).toBe(false)
  })

  it('calculates points with optional penalty', () => {
    expect(calculateNetPoints(10, 3, true)).toBe(7)
    expect(calculateNetPoints(10, 3, false)).toBe(10)
  })

  it('calculates period payout from base and extra', () => {
    expect(calculatePeriodPayout(120, 40)).toBe(160)
    expect(calculatePeriodPayout(-10, 20)).toBe(20)
  })

  it('filters and sums settlements by payout status', () => {
    const settlements = [
      { totalPaid: 100, paidAt: null },
      { totalPaid: 200, paidAt: '2026-07-30T10:00:00.000Z' },
      { totalPaid: 300, paidAt: null },
    ]

    expect(filterSettlementsByPaymentStatus(settlements, 'all')).toHaveLength(3)
    expect(filterSettlementsByPaymentStatus(settlements, 'paid')).toHaveLength(1)
    expect(filterSettlementsByPaymentStatus(settlements, 'unpaid')).toHaveLength(2)
    expect(getUnpaidTotal(settlements)).toBe(400)
  })

  it('applies compound interest to unpaid settlements only', () => {
    const asOf = new Date('2026-08-02T12:00:00.000Z')
    const settlements = [
      {
        totalPaid: 100,
        paidAt: null,
        createdAt: '2026-06-02T12:00:00.000Z',
      },
      {
        totalPaid: 200,
        paidAt: '2026-07-20T12:00:00.000Z',
        createdAt: '2026-05-02T12:00:00.000Z',
      },
      {
        totalPaid: 300,
        paidAt: null,
        createdAt: '2026-07-02T12:00:00.000Z',
      },
    ]

    const result = calculateUnpaidTotalWithInterest(settlements, 10, 'month', asOf)

    expect(result.principal).toBe(400)
    expect(result.totalWithInterest).toBe(451)
    expect(result.interest).toBe(51)
  })

  it('returns principal unchanged when rate is zero', () => {
    const asOf = new Date('2026-08-02T12:00:00.000Z')
    const settlements = [
      {
        totalPaid: 250,
        paidAt: null,
        createdAt: '2026-07-02T12:00:00.000Z',
      },
    ]

    const result = calculateUnpaidTotalWithInterest(settlements, 0, 'week', asOf)

    expect(result.principal).toBe(250)
    expect(result.totalWithInterest).toBe(250)
    expect(result.interest).toBe(0)
  })

  it('calculates interest only on remaining balance after withdrawal', () => {
    const asOf = new Date('2026-08-02T12:00:00.000Z')
    const settlements = [
      {
        totalPaid: 500,
        withdrawnAmount: 200,
        paidAt: null,
        createdAt: '2026-07-02T12:00:00.000Z',
      },
    ]

    const result = calculateUnpaidTotalWithInterest(settlements, 10, 'month', asOf)

    expect(result.principal).toBe(300)
    expect(result.totalWithInterest).toBe(330)
    expect(result.interest).toBe(30)
  })
})
