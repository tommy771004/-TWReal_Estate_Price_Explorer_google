import { createHmac, randomUUID } from 'node:crypto'

type TelemetryValue = string | number | boolean | null

/** Best-effort server relay. Keep user-entered keywords, address details, and coordinates out of telemetry. */
export function sendTelemetry(name: string, properties: Record<string, TelemetryValue> = {}): void {
  const url = process.env.TELEMETRY_INGEST_URL
  const project = process.env.TELEMETRY_PROJECT_KEY
  const key = process.env.TELEMETRY_INGEST_KEY
  if (!url || !project || !key) return

  const raw = JSON.stringify({
    events: [{ id: randomUUID(), name, source: 'server', occurredAt: new Date().toISOString(), properties }],
  })
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = `sha256=${createHmac('sha256', key).update(`${timestamp}.`).update(raw).digest('hex')}`

  void fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telemetry-project': project,
      'x-telemetry-timestamp': timestamp,
      'x-telemetry-signature': signature,
    },
    body: raw,
  }).catch((err) => console.warn('[telemetry] forward failed:', err instanceof Error ? err.message : String(err)))
}
