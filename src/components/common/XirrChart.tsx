import Highcharts from 'highcharts'
import HighchartsReactModule from 'highcharts-react-official'
import { useMemo } from 'react'
import { fonts } from '../../theme'
import { perfPalette as P } from '../../theme/pms'

const HighchartsReact =
  (HighchartsReactModule as unknown as { default?: typeof HighchartsReactModule }).default ??
  HighchartsReactModule

interface Props {
  categories: string[]
  portfolio: number[]
  benchmark: number[]
  /** Rendered height in CSS px */
  height: number
  /** [top, right, bottom, left] plot margins in CSS px */
  margin: [number, number, number, number]
  /** Axis label size in CSS px */
  fontSize: number
}

/** Portfolio vs Benchmark grouped columns (Highcharts), 0-25% axis, rounded bar tops, hover dims the other bars. */
export default function XirrChart({ categories, portfolio, benchmark, height, margin, fontSize }: Props) {
  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'column', height, backgroundColor: 'transparent', marginTop: margin[0], marginRight: margin[1], marginBottom: margin[2], marginLeft: margin[3], style: { fontFamily: fonts.base }, animation: { duration: 600 } },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      accessibility: { enabled: false },
      xAxis: {
        categories, lineColor: P.chartGrid, lineWidth: 1.5, tickLength: 0,
        labels: { y: fontSize * 1.9, style: { color: P.chartCategory, fontSize: `${fontSize}px` } },
      },
      yAxis: {
        title: { text: undefined }, min: 0, max: 25, tickInterval: 5, gridLineColor: P.chartGrid, gridLineWidth: 1.5,
        labels: { format: '{value}%', x: -fontSize * 0.9, style: { color: P.chartAxis, fontSize: `${fontSize}px` } },
      },
      tooltip: {
        shared: true, useHTML: true, outside: true, shadow: false, borderWidth: 0, padding: 0, backgroundColor: 'transparent',
        formatter() {
          const pts = (this as unknown as { points: { series: { name: string }; y: number; color: string }[]; x: string }).points
          const x = (this as unknown as { x: string }).x
          const rows = pts.map((p) => `<div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span>${p.series.name}: <b>${p.y.toFixed(2)}%</b></div>`).join('')
          return `<div style="background:${P.tooltipBg};color:${P.tooltipText};padding:6px 10px;border-radius:8px;font:600 12px ${fonts.base}"><div style="opacity:.75;margin-bottom:3px">${x}</div>${rows}</div>`
        },
      },
      plotOptions: {
        column: {
          groupPadding: 0.207, pointPadding: 0.084, borderWidth: 0, borderRadius: { radius: 5, where: 'end' } as unknown as number,
          states: { hover: { brightness: 0.08 }, inactive: { opacity: 0.55 } },
        },
      },
      series: [
        { type: 'column', name: 'Portfolio', color: P.chartPortfolio, data: portfolio },
        { type: 'column', name: 'Benchmark', color: P.chartBenchmark, data: benchmark },
      ],
    }),
    [categories, portfolio, benchmark, height, margin, fontSize],
  )
  return <HighchartsReact highcharts={Highcharts} options={options} />
}
