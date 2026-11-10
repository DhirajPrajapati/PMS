import { colors, fonts } from '../../theme'

/** Dark tooltip card shared by the Highcharts charts. */
export function tooltipHtml(heading: string, rows: { color: string; text: string }[]) {
  const body = rows.map((r) => `<div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:${r.color}"></span>${r.text}</div>`).join('')
  return `<div style="background:${colors.text.ink};color:${colors.base.white};padding:6px 10px;border-radius:8px;font:600 12px ${fonts.base}"><div style="opacity:.75;margin-bottom:3px">${heading}</div>${body}</div>`
}

export const tooltipBase = { useHTML: true, outside: true, shadow: false, borderWidth: 0, padding: 0, backgroundColor: 'transparent' } as const
