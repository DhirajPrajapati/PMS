import Highcharts from 'highcharts'
import HighchartsReactModule from 'highcharts-react-official'
import { useMemo } from 'react'
import { colors, fonts } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import { tooltipBase, tooltipHtml } from './chartTooltip'

const HighchartsReact =
  (HighchartsReactModule as unknown as { default?: typeof HighchartsReactModule }).default ??
  HighchartsReactModule

interface Props {
  title: string
  subtitle: string
  /** One label per data point (e.g. "Jan'24") */
  categories: string[]
  /** Indices that get an axis label */
  labelAt: number[]
  /** Y axis ticks, first/last are the axis min/max */
  ticks: number[]
  series: { name: string; data: number[]; color: string; dashed?: boolean; fill?: boolean }[]
  height: number
  /** [top, right, bottom, left] plot margins in CSS px */
  margin: [number, number, number, number]
  /** Heading inset from the card edge in CSS px */
  inset: number
  fontSize: number
  titleSize: number
  subtitleSize: number
  legendSize: number
}

/** Smooth trend lines with title, subtitle and legend drawn by Highcharts itself. */
export default function TrajectoryChart({ title, subtitle, categories, labelAt, ticks, series, height, margin, inset, fontSize, titleSize, subtitleSize, legendSize }: Props) {
  const options = useMemo<Highcharts.Options>(() => {
    const label = { color: P.chartAxis, fontSize: `${fontSize}px` }
    return {
      chart: { height, backgroundColor: 'transparent', marginTop: margin[0], marginRight: margin[1], marginBottom: margin[2], marginLeft: margin[3], style: { fontFamily: fonts.base }, animation: { duration: 700 } },
      title: { text: title, align: 'left', x: inset - 10, y: titleSize * 2.1, style: { color: colors.text.ink, fontSize: `${titleSize}px`, fontWeight: '700' } },
      subtitle: { text: subtitle, align: 'left', x: inset - 10, y: titleSize * 3.9, style: { color: colors.text.mutedWarm, fontSize: `${subtitleSize}px` } },
      credits: { enabled: false },
      accessibility: { enabled: false },
      legend: { align: 'right', verticalAlign: 'top', floating: true, x: 0, y: titleSize * 1.1, itemStyle: { color: colors.text.ink, fontSize: `${legendSize}px`, fontWeight: '400' }, itemHoverStyle: { color: colors.text.ink }, symbolHeight: 2, symbolWidth: 12, symbolRadius: 1, itemDistance: 14, squareSymbol: false },
      xAxis: {
        min: 0, max: categories.length - 1, tickPositions: labelAt, lineWidth: 0, tickLength: 0, tickmarkPlacement: 'on',
        labels: { y: fontSize * 3.4, style: label, formatter() { return categories[this.value as number] ?? '' } },
      },
      yAxis: {
        title: { text: undefined }, min: ticks[0], max: ticks[ticks.length - 1], tickPositions: ticks, gridLineColor: P.chartGrid, gridLineDashStyle: 'Dot', gridLineWidth: 1,
        labels: { x: -fontSize * 1.5, style: label },
      },
      tooltip: {
        ...tooltipBase, shared: true,
        formatter() {
          const t = this as unknown as { x: number; points: { series: { name: string }; y: number; color: string }[] }
          return tooltipHtml(categories[t.x] ?? '', t.points.map((p) => ({ color: p.color as string, text: `${p.series.name}: <b>${p.y.toFixed(2)}%</b>` })))
        },
      },
      plotOptions: { series: { marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } }, states: { hover: { lineWidthPlus: 0 } } } },
      series: series.map((s) => ({
        type: s.fill ? 'areaspline' : 'spline', name: s.name, data: s.data, color: s.color, lineWidth: 2.2, dashStyle: s.dashed ? 'Dash' : 'Solid',
        ...(s.fill ? { fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, Highcharts.color(s.color).setOpacity(0.13).get('rgba') as string], [1, Highcharts.color(s.color).setOpacity(0).get('rgba') as string]] }, threshold: ticks[0] } : {}),
      })) as Highcharts.SeriesOptionsType[],
    }
  }, [title, subtitle, categories, labelAt, ticks, series, height, margin, inset, fontSize, titleSize, subtitleSize, legendSize])
  return <HighchartsReact highcharts={Highcharts} options={options} />
}
