import { Box, ButtonBase } from '@mui/material'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { useState } from 'react'
import { rem } from '../../utils/format'
import Collapse from './Collapse'
import { colors, fonts } from '../../theme'

const C = { line: colors.border.default, gold: colors.gold.base, text: colors.text.strong, key: colors.brand.primary, str: colors.status.positiveText, num: colors.blue[390], punct: colors.text.subtle }

/** Very small JSON highlighter: returns spans for keys, strings, numbers and literals. */
function highlight(json: string) {
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g
  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(json))) {
    if (m.index > last) out.push(json.slice(last, m.index))
    const color = m[1] ? (m[2] ? C.key : C.str) : m[3] ? C.num : C.gold
    out.push(
      <Box key={i++} component="span" sx={{ color }}>
        {m[1] ?? m[3] ?? m[4]}
      </Box>,
    )
    if (m[2]) out.push(m[2])
    last = re.lastIndex
  }
  out.push(json.slice(last))
  return out
}

interface Props {
  /** e.g. "GET /api/pms/strategies" */
  endpoint: string
  /** undefined while the request is in flight */
  data?: unknown
  label?: string
  defaultOpen?: boolean
  /** CSS max-height of the JSON area before it scrolls */
  maxHeight?: string
}

/** Collapsible, copyable view of a (mock) API response in its { status, message, data } envelope. */
export default function ApiResponsePanel({ endpoint, data, label, defaultOpen = true, maxHeight = rem(340) }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const json = data === undefined ? '// waiting for response…' : JSON.stringify(data, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const [method, ...path] = endpoint.split(' ')
  return (
    <Box sx={{ border: `${rem(1)} solid ${C.line}`, borderRadius: rem(14), bgcolor: colors.base.white, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10), px: rem(14), minHeight: rem(44) }}>
        <ButtonBase
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', gap: rem(10), py: rem(10), fontFamily: 'inherit', textAlign: 'left' }}
        >
          <Box sx={{ display: 'flex', color: C.gold, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .3s cubic-bezier(.4,0,.2,1)' }}>
            <ChevronDown size="1rem" strokeWidth={2.2} />
          </Box>
          {label && <Box component="span" sx={{ fontSize: rem(12.5), fontWeight: 700, color: C.text }}>{label}</Box>}
          <Box component="span" sx={{ px: rem(7), py: rem(2), borderRadius: rem(5), bgcolor: colors.green[931], color: colors.status.positiveText, fontSize: rem(10.5), fontWeight: 800, letterSpacing: '0.04em' }}>
            {method}
          </Box>
          <Box component="span" sx={{ fontFamily: fonts.mono, fontSize: rem(12), color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {path.join(' ')}
          </Box>
        </ButtonBase>
        <ButtonBase
          onClick={copy}
          aria-label="Copy response"
          sx={{ gap: rem(5), px: rem(9), height: rem(26), borderRadius: rem(7), border: `${rem(1)} solid ${C.line}`, fontFamily: 'inherit', fontSize: rem(11.5), color: copied ? colors.status.positiveText : colors.brown[375] }}
        >
          {copied ? <Check size="0.75rem" /> : <Copy size="0.75rem" />}
          {copied ? 'Copied' : 'Copy'}
        </ButtonBase>
      </Box>
      <Collapse open={open}>
        <Box
          component="pre"
          tabIndex={0}
          sx={{
            m: 0, px: rem(16), py: rem(12), maxHeight, overflow: 'auto', bgcolor: colors.surface.panel, borderTop: `${rem(1)} solid ${C.line}`,
            fontFamily: fonts.mono, fontSize: rem(11.5), lineHeight: 1.55, color: C.punct, tabSize: 2,
          }}
        >
          {data === undefined ? json : highlight(json)}
        </Box>
      </Collapse>
    </Box>
  )
}
