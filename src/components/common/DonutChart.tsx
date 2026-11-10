import { Box } from '@mui/material'
import Highcharts from 'highcharts'
import HighchartsReactModule from 'highcharts-react-official'
import { useMemo, type ReactNode } from 'react'
import { rem } from '../../utils/format'
import { colors, fonts } from '../../theme'

const HighchartsReact =
  (HighchartsReactModule as unknown as { default?: typeof HighchartsReactModule }).default ??
  HighchartsReactModule

export interface DonutSlice {
  name: string
  y: number
  color: string
  /** Shown under the name in the hover tooltip */
  detail?: string
}

interface Props {
  data: DonutSlice[]
  /** Diameter in px (emitted as rem) */
  size: number
  /** Hole diameter as a share of the outer one */
  innerRatio?: number
  ariaLabel?: string
  /** Rounded slices separated by gaps (default) vs flat slices with hairline separators */
  rounded?: boolean
  /** Thin progress-ring look: no separators, small rounded caps, no hover or tooltip */
  gauge?: boolean
  /** Rendered in the hole */
  children?: ReactNode
}

/** Highcharts donut, slices clockwise from 12 o'clock, with optional centre content. */
export default function DonutChart({ data, size, innerRatio = 0.625, ariaLabel, rounded = true, gauge = false, children }: Props) {
  const px = (size / 16) * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)
  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'pie', backgroundColor: 'transparent', width: px, height: px, margin: 0, spacing: [0, 0, 0, 0], animation: { duration: 500 }, style: { fontFamily: fonts.base } },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        enabled: !gauge, useHTML: true, outside: true, shadow: false, borderWidth: 0, borderRadius: 8, padding: 0, backgroundColor: 'transparent',
        formatter() {
          const p = this as unknown as { key: string; y: number; color: string; point: { detail?: string } }
          return `<div style="background:${colors.text.ink};color:${colors.base.white};padding:6px 10px;border-radius:8px;font:600 12px ${fonts.base};white-space:nowrap"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.key}: <b>${p.y.toFixed(2)}%</b>${p.point.detail ? `<div style="font-weight:500;opacity:.75;margin-top:2px">${p.point.detail}</div>` : ''}</div>`
        },
      },
      accessibility: { enabled: false },
      plotOptions: {
        pie: {
          size: '100%', innerSize: `${innerRatio * 100}%`, borderWidth: gauge ? 0 : rounded ? 2 : 1, borderColor: colors.base.white, borderRadius: gauge ? 3 : rounded ? 6 : 0, enableMouseTracking: !gauge, dataLabels: { enabled: false }, cursor: 'pointer',
          // hovered slice pops (halo ring), the others fade back
          states: { hover: { enabled: true, brightness: 0, halo: { size: 7, opacity: 0.28 } }, inactive: { enabled: true, opacity: 0.35 } },
        },
      },
      series: [{ type: 'pie', name: ariaLabel, data: data.map((d) => ({ name: d.name, y: d.y, color: d.color, detail: d.detail })) }],
    }),
    [data, px, innerRatio, ariaLabel, rounded, gauge],
  )
  return (
    <Box role="img" aria-label={ariaLabel} sx={{ position: 'relative', width: rem(size), height: rem(size), mx: 'auto' }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
      {children && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>{children}</Box>}
    </Box>
  )
}
