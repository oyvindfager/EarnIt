import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type PeriodType = 'week' | 'month'
type HistoryFilter = 'all' | PeriodType

type ParentDashboardProps = {
  view: 'overview' | 'history'
  mandatoryCompletionPct: number
  mandatoryDoneTotal: number
  mandatoryRequiredTotal: number
  pointsAvailableNow: number
  netPointsThisPeriod: number
  reachedLevelName: string
  projectedExtra: number
  projectedTotalAllowance: number
  payoutChartData: Array<{ name: string; amount: number }>
  levelProgressData: Array<{ name: string; na: number; mal: number }>
  mandatoryProgressData: Array<{ name: string; gjort: number; krav: number }>
  bonusContributionData: Array<{ name: string; poeng: number }>
  penaltyContributionData: Array<{ name: string; trekk: number }>
  penaltyEnabled: boolean
  settlementHistoryData: Array<{
    periode: string
    utbetaling: number
    poeng: number
    periodType: PeriodType
  }>
  historyFilter: HistoryFilter
  onHistoryFilterChange: (historyFilter: HistoryFilter) => void
}

function ParentDashboard(props: ParentDashboardProps) {
  const filteredHistoryData = useMemo(() => {
    if (props.historyFilter === 'all') {
      return props.settlementHistoryData
    }
    return props.settlementHistoryData.filter((item) => item.periodType === props.historyFilter)
  }, [props.historyFilter, props.settlementHistoryData])

  return (
    <>
      {props.view === 'overview' && <section className="kpi-grid premium-kpis">
        <article>
          <p>Obligatorisk progresjon</p>
          <strong>{props.mandatoryCompletionPct}%</strong>
          <span>
            {props.mandatoryDoneTotal}/{props.mandatoryRequiredTotal} fullført
          </span>
        </article>
        <article>
          <p>Poeng tilgjengelig</p>
          <strong>{props.pointsAvailableNow}</strong>
          <span>
            {props.netPointsThisPeriod >= 0
              ? `${props.netPointsThisPeriod} netto poeng denne perioden`
              : `${Math.abs(props.netPointsThisPeriod)} netto trekk denne perioden`}
          </span>
        </article>
        <article>
          <p>Nivå akkurat nå</p>
          <strong>{props.reachedLevelName}</strong>
          <span>{props.projectedExtra} kr i bonus</span>
        </article>
        <article>
          <p>Forventet utbetaling</p>
          <strong>{props.projectedTotalAllowance} kr</strong>
          <span>Oppdateres automatisk etter registrerte aktiviteter.</span>
        </article>
      </section>}

      {props.view === 'overview' && <section className="dashboard-grid">
        <article className="card chart-card chart-span-2 chart-hero">
          <h2>Utbetalingsprognose</h2>
          <p className="mini">Sammenligner grunnlønn, bonus og total for aktiv periode.</p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={props.payoutChartData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#e67e22" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <h2>Poengfremdrift</h2>
          <p className="mini">Fremdriften vises direkte i stolpediagrammet.</p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={props.levelProgressData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="na" fill="#2a9d8f" name="Nå" radius={[8, 8, 0, 0]} />
                <Bar dataKey="mal" fill="#264653" name="Mål" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <h2>Obligatoriske oppgaver</h2>
          <p className="mini">Viser hva som er gjort opp mot krav per oppgave.</p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={props.mandatoryProgressData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gjort" fill="#2a9d8f" name="Gjort" radius={[8, 8, 0, 0]} />
                <Bar dataKey="krav" fill="#8d99ae" name="Krav" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <h2>Poeng fra ekstraoppgaver</h2>
          <p className="mini">Poengbidrag per ekstraoppgave i valgt periode.</p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={props.bonusContributionData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="poeng" fill="#f4a261" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {props.penaltyEnabled && (
          <article className="card chart-card">
            <h2>Trekk i poeng</h2>
            <p className="mini">Trekker ned total poengsum i valgt periode.</p>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={props.penaltyContributionData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trekk" fill="#d64545" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        )}

      </section>}

      {props.view === 'history' && <section className="dashboard-grid">
        <article className="card chart-card chart-span-2">
          <div className="history-head">
            <div>
              <h2>Historikk: Utbetaling og poeng</h2>
              <p className="mini">Filtrer historikk på uke/måned for å sammenligne perioder.</p>
            </div>
            <label className="mini history-filter">
              Vis
              <select
                value={props.historyFilter}
                onChange={(event) => props.onHistoryFilterChange(event.target.value as HistoryFilter)}
              >
                <option value="all">Alle perioder</option>
                <option value="week">Kun uker</option>
                <option value="month">Kun måneder</option>
              </select>
            </label>
          </div>
          {filteredHistoryData.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredHistoryData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="periode" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utbetaling" fill="#264653" name="Utbetaling (kr)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="poeng" fill="#2a9d8f" name="Poeng" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mini">Ingen avsluttede perioder i valgt filter ennå.</p>
          )}
        </article>
      </section>}
    </>
  )
}

export default ParentDashboard
