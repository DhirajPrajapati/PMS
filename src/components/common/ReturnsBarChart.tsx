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
  categories: string[]
  portfolio: number[]
  /** Omit to draw the portfolio series only */
  benchmark?: number[]
  height: number
  /** [top, right, bottom, left] plot margins in CSS px */
  margin: [number, number, number, number]
  fontSize: number
  /** Legend text size; the colour squares are slightly larger */
  legendSize: number
  /** Truncate category labels to this width (px) with an ellipsis */
  labelWidth?: number
}

/** Positive/negative periodic returns: Portfolio vs Benchmark columns, zero baseline, legend bottom-right. */
export default function ReturnsBarChart({ categories, portfolio, benchmark, height, margin, fontSize, legendSize, labelWidth }: Props) {
  const options = useMemo<Highcharts.Options>(() => {
    const label = { color: P.chartAxis, fontSize: `${fontSize}px` }
    return {
      chart: { type: 'column', height, backgroundColor: 'transparent', marginTop: margin[0], marginRight: margin[1], marginBottom: margin[2], marginLeft: margin[3], style: { fontFamily: fonts.base }, animation: { duration: 600 } },
      title: { text: undefined },
      credits: { enabled: false },
      accessibility: { enabled: false },
      legend: { align: 'right', verticalAlign: 'bottom', itemStyle: { color: colors.text.ink, fontSize: `${legendSize}px`, fontWeight: '400' }, itemHoverStyle: { color: colors.text.ink }, symbolRadius: 2, symbolHeight: legendSize * 1.05, symbolWidth: legendSize * 1.05, itemDistance: legendSize * 1.8, margin: 0, padding: 0 },
      xAxis: { categories, lineColor: P.zeroLine, lineWidth: 0, tickLength: 0, labels: { y: fontSize * 1.9, rotation: 0, style: { ...label, fontSize: `${fontSize}px`, ...(labelWidth ? { width: labelWidth, textOverflow: 'ellipsis' } : {}) } } },
      yAxis: {
        title: { text: undefined }, min: -6, max: 6, tickInterval: 2, gridLineColor: P.chartGrid, gridLineWidth: 1,
        labels: { x: -fontSize * 0.6, style: label },
        plotLines: [{ value: 0, width: 1.2, color: P.zeroLine, zIndex: 3 }],
      },
      tooltip: {
        ...tooltipBase, shared: true,
        formatter() {
          const t = this as unknown as { x: string; points: { series: { name: string }; y: number; color: string }[] }
          return tooltipHtml(t.x, t.points.map((p) => ({ color: p.color as string, text: `${p.series.name}: <b>${p.y.toFixed(2)}%</b>` })))
        },
      },
      plotOptions: { column: { groupPadding: 0.33, pointPadding: 0, borderWidth: 0, states: { hover: { brightness: 0.12 }, inactive: { opacity: 0.55 } } } },
      series: [
        { type: 'column', name: 'Portfolio', color: P.barPortfolio, data: portfolio },
        ...(benchmark ? [{ type: 'column' as const, name: 'Benchmark', color: P.barBenchmark, data: benchmark }] : []),
      ],
    }
  }, [categories, portfolio, benchmark, height, margin, fontSize, legendSize, labelWidth])
  return <HighchartsReact highcharts={Highcharts} options={options} />
}
