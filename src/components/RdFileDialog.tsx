import { Box, ButtonBase, Dialog } from '@mui/material'
import { TriangleAlert, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchRdFile, type RdFile, type RdRow } from '../api/rdFile'
import { rem } from '../utils/format'
import Logo from './common/Logo'
import type { PmsStrategy } from './cards/PmsCard'
import { colors, gradients, overlays, shadows } from '../theme'

const MOBILE = '@media (max-width:48rem)'

const C = {
  gold: colors.gold.base,
  text: colors.text.dialog,
  line: colors.border.default,
  rule: colors.sand[859],
  tint: colors.cream[955],
}

const COLS = `${rem(301.5)} 1fr`
const COLS_MOBILE = '1.6fr 1fr'

const headCell = {
  fontSize: rem(9.5), fontWeight: 600, letterSpacing: '0.05em', lineHeight: rem(14),
  color: C.gold, textTransform: 'uppercase',
} as const

/** Builds a CSV of the table and saves it, so Download works without a file server. */
function downloadCsv(file: RdFile) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = [['Security Name', 'Market Value'], ...file.rows.map((r) => [r.label, String(r.value)])]
    .map((cols) => cols.map(esc).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = file.file_name
  a.click()
  URL.revokeObjectURL(url)
}

function Row({ row }: { row: RdRow }) {
  const bold = row.type !== 'item'
  return (
    <Box
      sx={{
        display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', columnGap: rem(8),
        minHeight: rem(32), px: rem(13.5), py: rem(6), boxSizing: 'border-box',
        fontSize: rem(10), lineHeight: rem(15), color: C.text,
        fontWeight: bold ? 700 : 400,
        bgcolor: row.type === 'total' ? C.tint : 'transparent',
        borderTop: `${rem(bold ? 1.5 : 1)} solid ${bold ? C.rule : C.line}`,
        [MOBILE]: { gridTemplateColumns: COLS_MOBILE, px: rem(12), fontSize: rem(9.5) },
      }}
    >
      <Box>{row.label}</Box>
      <Box sx={{ wordBreak: 'break-all' }}>{String(row.value)}</Box>
    </Box>
  )
}

interface Props {
  /** Dialog is open while a strategy is set */
  strategy: PmsStrategy | null
  onClose: () => void
}

export default function RdFileDialog({ strategy, onClose }: Props) {
  const [file, setFile] = useState<RdFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const id = strategy?.id

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setFile(null)
    setError(null)
    fetchRdFile(id)
      .then((d) => !cancelled && setFile(d))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <Dialog
      open={!!strategy}
      onClose={onClose}
      aria-labelledby="rd-file-title"
      slotProps={{
        backdrop: { sx: { bgcolor: overlays.backdrop, backdropFilter: 'blur(3px)' } },
        paper: {
          sx: {
            width: rem(576), maxWidth: `calc(100% - ${rem(32)})`, maxHeight: `calc(100% - ${rem(32)})`, m: 0,
            borderRadius: rem(20), overflow: 'hidden', bgcolor: colors.surface.dialog, fontFamily: 'inherit',
            boxShadow: shadows.dialog,
          },
        },
      }}
    >
      <Box sx={{ height: rem(3), flexShrink: 0, background: gradients.accentBar }} />

      <Box
        sx={{
          bgcolor: colors.base.white, display: 'flex', alignItems: 'center', gap: rem(10), height: rem(49), px: rem(20),
          borderBottom: `${rem(1)} solid ${C.line}`, flexShrink: 0,
        }}
      >
        <Logo size={rem(20)} />
        <Box id="rd-file-title" component="h2" sx={{ m: 0, flex: 1, fontFamily: 'inherit', fontSize: rem(13.5), fontWeight: 700, color: colors.brown[114] }}>
          Tentative RD File
        </Box>
        <ButtonBase
          aria-label="Close"
          onClick={onClose}
          sx={{ width: rem(24), height: rem(24), borderRadius: '50%', bgcolor: colors.surface.chip, color: colors.brown[294] }}
        >
          <X size="0.75rem" strokeWidth={2.2} />
        </ButtonBase>
      </Box>

      <Box sx={{ px: rem(20), pt: rem(20), pb: rem(19), overflowY: 'auto', [MOBILE]: { px: rem(16) } }}>
        <Box sx={{ border: `${rem(1)} solid ${C.line}`, borderRadius: rem(14), overflow: 'hidden', bgcolor: colors.base.white }}>
          <Box
            sx={{
              display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', columnGap: rem(8), height: rem(34),
              px: rem(13.5), bgcolor: C.tint, [MOBILE]: { gridTemplateColumns: COLS_MOBILE, px: rem(12) },
            }}
          >
            <Box sx={headCell}>Security Name</Box>
            <Box sx={headCell}>Market Value</Box>
          </Box>
          {!file && !error && <Box sx={{ py: rem(24), textAlign: 'center', fontSize: rem(12), color: colors.text.muted }}>Loading…</Box>}
          {error && <Box sx={{ py: rem(24), textAlign: 'center', fontSize: rem(12), color: colors.status.errorText }}>{error}</Box>}
          {file?.rows.map((r, i) => <Row key={i} row={r} />)}
        </Box>

        {file && (
          <Box
            sx={{
              mt: rem(13), display: 'flex', gap: rem(10), alignItems: 'center', px: rem(14), py: rem(12),
              borderRadius: rem(12), bgcolor: colors.cream[972], border: `${rem(1)} solid ${colors.sand[773]}`,
              fontSize: rem(9.75), lineHeight: rem(15), color: colors.brown[318],
            }}
          >
            <Box sx={{ flexShrink: 0, display: 'flex', color: colors.gold.deep }}>
              <TriangleAlert size="0.8125rem" strokeWidth={1.8} />
            </Box>
            <Box>
              <b>Disclaimer:</b> {file.disclaimer}
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          bgcolor: colors.base.white, display: 'flex', justifyContent: 'flex-end', px: rem(20), py: rem(13),
          borderTop: `${rem(1)} solid ${C.line}`, flexShrink: 0,
        }}
      >
        <ButtonBase
          disabled={!file}
          onClick={() => file && downloadCsv(file)}
          sx={{
            width: rem(102.5), height: rem(31.5), borderRadius: rem(12), bgcolor: colors.sand[620], color: colors.base.white,
            fontFamily: 'inherit', fontSize: rem(10.5), fontWeight: 600, '&:hover': { bgcolor: colors.brown[569] },
            '&.Mui-disabled': { bgcolor: colors.sand[831], color: colors.base.white },
          }}
        >
          Download
        </ButtonBase>
      </Box>
    </Dialog>
  )
}
