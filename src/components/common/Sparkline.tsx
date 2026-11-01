import Highcharts from 'highcharts'
import HighchartsReactModule from 'highcharts-react-official'
import { useEffect, useMemo, useRef, useState } from 'react'
import { colors } from '../../theme'

// CJS interop: the default import may arrive wrapped as { default: Component }
const HighchartsReact =
  (HighchartsReactModule as unknown as { default?: typeof HighchartsReactModule }).default ??
  HighchartsReactModule

const THEMES = {
  positive: { line: colors.status.positive, top: colors.green[890], bottom: colors.green[965] },
  negative: { line: colors.status.negative, top: colors.rose[906], bottom: colors.rose[967] },
}

interface Props {
  /** Series values from the API. May contain negatives. */
  data: number[]
  /** Colours the chart green (true) or red (false). */
  positive: boolean
}

/** Fills its parent (size the parent in rem). */
export default function Sparkline({ data, positive }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  // Highcharts needs numeric dimensions: measure the rem-sized parent.
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
    const t = positive ? THEMES.positive : THEMES.negative
    const min = Math.min(...data)
    const max = Math.max(...data)
    return {
      chart: {
        type: 'area',
        backgroundColor: 'transparent',
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0],
        animation: false,
        width: size?.w,
        height: size?.h,
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      tooltip: { enabled: false },
      xAxis: { visible: false },
      // Fixed to the data range so negatives plot correctly; `threshold: min`
      // makes the fill run to the bottom edge.
      yAxis: {
        visible: false,
        min,
        max: max === min ? min + 1 : max,
        startOnTick: false,
        endOnTick: false,
      },
      plotOptions: {
        series: {
          animation: false,
          enableMouseTracking: false,
          marker: { enabled: false },
          lineWidth: 1,
          color: t.line,
          states: { inactive: { opacity: 1 } },
        },
        area: {
          threshold: min,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, t.top],
              [1, t.bottom],
            ],
          },
        },
      },
      series: [{ type: 'area', data }],
    }
  }, [data, positive, size])

  if (data.length < 2) return null
  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {size && <HighchartsReact highcharts={Highcharts} options={options} />}
    </div>
  )
}
