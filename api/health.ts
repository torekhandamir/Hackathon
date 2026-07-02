export default function handler(_req: any, res: any) {
  return res.status(200).json({
    ok: true,
    service: 'Review Booster API',
    openaiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    timestamp: new Date().toISOString(),
  })
}
