import { Box } from '@mui/material'
import { colors } from '../../theme'
import { reset } from '../../utils/responsive'

export interface LabelValueRow { label: string; value: string; /** Value colour; defaults to the strong text colour */ color?: string }
type Responsive = string | { xs: string; sm: string }

/** Label on the left, bold value on the right, one fixed-height row each. */
export default function LabelValueList({ rows, rowHeight, fontSize, sx }: { rows: LabelValueRow[]; rowHeight: Responsive; fontSize: Responsive; sx?: object }) {
  return (
    <Box sx={sx}>
      {rows.map((x) => (
        <Box key={x.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, height: rowHeight, ...reset, fontSize }}>
          <Box component="span" sx={{ color: colors.text.secondary }}>{x.label}</Box>
          <Box component="span" sx={{ fontWeight: 700, color: x.color ?? colors.text.strong, textAlign: 'right' }}>{x.value}</Box>
        </Box>
      ))}
    </Box>
  )
}
