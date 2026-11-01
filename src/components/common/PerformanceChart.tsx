import Highcharts from 'highcharts'
import HighchartsReactModule from 'highcharts-react-official'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatReturn } from '../../utils/format'
import { colors, fonts } from '../../theme'

const HighchartsReact =
  (HighchartsReactModule as unknown as { default?: typeof HighchartsReactModule }).default ??
  HighchartsReactModule

interface Props {
  benchmark: number
  portfolio: number
}

const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

/**
 * Two-bar column chart (Benchmark vs Portfolio). Fills its parent; size the
 * parent in rem. Handles negative returns.
 */
export default function PerformanceChart({ benchmark, portfolio }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const options = useMemo<Highcharts.Options>(() => {
    const r = remPx()
    const lo = Math.min(benchmark, portfolio)
    const hi = Math.max(benchmark, portfolio)
    // All-positive: start the axis below zero-ish so the bars differ visibly
    // (like the design). With negatives, include zero and add some headroom.
    const yMin = lo > 0 ? lo * 0.5 : Math.min(lo * 1.25, -0.5)
    const yMax = hi > 0 ? hi : 0
    // Keep the two bars a fixed distance apart and centred, however wide the card is.
    const plotW = 11.5 * r
    const sideMargin = Math.max(0.8125 * r, ((size?.w ?? 0) - plotW) / 2)
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        width: size?.w,
        height: size?.h,
        margin: [0, sideMargin, 1.875 * r, sideMargin],
        spacing: [0, 0, 0, 0],
        animation: { duration: 350 },
        style: { fontFamily: fonts.base },
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      tooltip: { enabled: false },
      xAxis: {
        categories: ['Benchmark', 'Portfolio'],
        lineWidth: 0,
        tickLength: 0,
        labels: { y: 1.5 * r, style: { fontSize: '0.7625rem', color: colors.gray[345] } },
      },
      yAxis: { visible: false, min: yMin, max: yMax, startOnTick: false, endOnTick: false, gridLineWidth: 0 },
      plotOptions: {
        column: {
          pointWidth: 5 * r,
          borderWidth: 0,
          borderRadius: { radius: 0.625 * r, where: 'end' },
          animation: { duration: 350 },
          states: { hover: { enabled: false }, inactive: { enabled: false } },
          dataLabels: {
            enabled: true,
            inside: true,
            crop: false,
            overflow: 'allow',
            verticalAlign: 'top',
            y: 0.5 * r,
            formatter() {
              return formatReturn(this.y ?? 0)
            },
            style: { fontSize: '0.75rem', fontWeight: '400', color: colors.gray[302], textOutline: 'none' },
          },
        },
      },
      series: [
        {
          type: 'column',
          data: [
            { y: benchmark, color: colors.gray[871] },
            { y: portfolio, color: colors.cream[904] },
          ],
        },
      ],
    }
  }, [benchmark, portfolio, size])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      {size && <HighchartsReact highcharts={Highcharts} options={options} />}
    </div>
  )
}
