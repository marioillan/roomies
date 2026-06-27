import * as React from 'react'
import { Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ── ChartContainer ──────────────────────────────────────────────────
// Inyecta las variables CSS de color del config y envuelve en ResponsiveContainer.

export function ChartContainer({ config, children, className, ...props }) {
  const cssVars = Object.entries(config ?? {}).reduce((acc, [key, val]) => {
    if (val.color) acc[`--color-${key}`] = val.color
    return acc
  }, {})

  return (
    <div style={cssVars} className={`w-full ${className ?? ''}`} {...props}>
      <ResponsiveContainer width='100%' height='100%'>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

// ── ChartTooltip ────────────────────────────────────────────────────
// Re-exporta el Tooltip de recharts para usarlo con ChartTooltipContent.

export const ChartTooltip = Tooltip

// ── ChartTooltipContent ─────────────────────────────────────────────

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  formatter,
  labelFormatter,
  hideLabel = false,
  indicator = 'dot',
}) {
  if (!active || !payload?.length) return null

  const labelDisplay = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label, payload)
      : label

  return (
    <div className='rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl text-xs'>
      {labelDisplay && (
        <p className='font-semibold text-slate-600 mb-1.5'>{labelDisplay}</p>
      )}
      <div className='flex flex-col gap-1'>
        {payload.map((item) => {
          const cfg = config?.[item.dataKey]
          const color = item.stroke ?? item.fill ?? cfg?.color ?? '#64748b'
          const etiqueta = cfg?.label ?? item.name ?? item.dataKey
          const valor = formatter ? formatter(item.value, item.dataKey, item) : item.value

          return (
            <div key={item.dataKey} className='flex items-center gap-2'>
              {indicator === 'dot' && (
                <span
                  className='w-2 h-2 rounded-full shrink-0'
                  style={{ backgroundColor: color }}
                />
              )}
              {indicator === 'line' && (
                <span
                  className='w-3 h-0.5 shrink-0 rounded-full'
                  style={{ backgroundColor: color }}
                />
              )}
              {indicator === 'dashed' && (
                <span
                  className='w-3 border-t-2 border-dashed shrink-0'
                  style={{ borderColor: color }}
                />
              )}
              <span className='text-slate-500'>{etiqueta}</span>
              <span className='ml-auto font-mono font-semibold text-slate-800 pl-4'>{valor}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ChartLegend ─────────────────────────────────────────────────────

export const ChartLegend = Legend

export function ChartLegendContent({ payload, config }) {
  if (!payload?.length) return null
  return (
    <div className='flex items-center justify-center gap-4 text-xs mt-2'>
      {payload.map((item) => {
        const cfg = config?.[item.dataKey ?? item.value]
        const color = item.color ?? cfg?.color ?? '#64748b'
        const etiqueta = cfg?.label ?? item.value
        return (
          <div key={item.value} className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-sm shrink-0' style={{ backgroundColor: color }} />
            <span className='text-slate-500'>{etiqueta}</span>
          </div>
        )
      })}
    </div>
  )
}
