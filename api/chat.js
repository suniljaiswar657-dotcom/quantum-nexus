// Vercel Serverless Function: all model requests stay server-side.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const hits = new Map();

function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
function systemPrompt(mode) {
  const base = 'You are Nexus AI, a practical and honest assistant. Reply in the language the user uses; if they use Hinglish, use simple Hinglish. Be specific, useful, and transparent about uncertainty. Never claim to have executed actions, accessed accounts, or verified facts unless the request actually did so. Do not ask for passwords, API keys, card numbers, or private credentials.';
  if (mode === 'automation') return base + ' Design workflows only. Clearly distinguish a proposed workflow from a running automation. Include trigger, steps, integrations, human approval, error handling, privacy/security considerations, and tests. Never imply an external action was executed.';
  if (mode === 'tool') return base + ' Act as a task-focused AI tool. Give a structured result with useful headings, concrete examples, and a short next step.';
  return base + ' Help with planning, writing, coding, learning, business ideation, and problem-solving. For high-impact decisions, note important limitations and recommend verification.';
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, {error:'Method not allowed. Use POST.'});
  }
  const raw = req.body;
  const message = typeof raw?.message === 'string' ? raw.message.trim() : '';
  const mode = ['chat','tool','automation'].includes(raw?.mode) ? raw.mode : 'chat';
  if (!message) return send(res, 400, {error:'Message is required.'});
  if (message.length > 1200) return send(res, 413, {error:'Message is too long. Maximum 1200 characters.'});

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const entry = hits.get(ip);
  if (entry && now - entry.start < WINDOW_MS && entry.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', '60');
    return send(res, 429, {error:'Too many requests. Please wait one minute and try again.'});
  }
  if (!entry || now - entry.start >= WINDOW_MS) hits.set(ip, {start:now,count:1});
  else entry.count += 1;

  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!token) return send(res, 503, {error:'AI service is not configured yet. Enable Vercel AI Gateway or set AI_GATEWAY_API_KEY in the server environment.'});
  const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-5.5';
  try {
    const upstream = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':'Bearer ' + token,'Content-Type':'application/json'},
      body:JSON.stringify({
        model,
        messages:[
          {role:'system',content:systemPrompt(mode)},
          {role:'user',content:message}
        ],
        max_tokens:900,
        temperature:0.6
      }),
      signal:AbortSignal.timeout(25_000)
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('AI Gateway request failed:', upstream.status);
      const status = upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status === 429 ? 429 : 502;
      return send(res, status, {error: status === 429 ? 'AI usage limit reached. Try again later.' : 'AI provider request failed. Check AI Gateway setup and model access.'});
    }
    const reply = payload?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) return send(res, 502, {error:'AI service returned an empty response.'});
    return send(res, 200, {reply:reply.trim(),model,mode});
  } catch (error) {
    console.error('AI Gateway connection error:', error?.name || 'unknown');
    return send(res, 502, {error:'Could not connect to the AI service. Please try again.'});
  }
};
