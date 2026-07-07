const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-3.5-turbo';

const CONFIGS = {
  expand: {
    system: 'You are a skilled writing assistant. Expand the given text with rich detail, relevant examples, and deeper insight while perfectly preserving the original tone, voice, and style. Follow any additional user instructions about tone, length, or direction. Return only the expanded text — no commentary, no prefixes.',
    temperature: 0.8,
    max_tokens: 2048,
  },
  summarize: {
    system: 'You are a precise summarizer. Condense the given text to its essential meaning, preserving all key points, data, and conclusions. Follow any additional user instructions about length, focus, or format. Return only the summary — no prefixes, no commentary.',
    temperature: 0.2,
    max_tokens: 512,
  },
  rephrase: {
    system: 'You are a clarity expert. Rewrite the given text to be clearer, more natural, and more engaging while keeping the exact same meaning and intent. Follow any additional user instructions about tone, style, or audience. Return only the rephrased text — no prefixes, no commentary.',
    temperature: 0.5,
    max_tokens: 1024,
  },
  continue: {
    system: 'You are a creative writing assistant. Continue the given text seamlessly, matching the style, tone, and voice of the original. Follow any additional user instructions about direction, mood, or length. Return only the continuation — no prefixes, no commentary.',
    temperature: 0.7,
    max_tokens: 1024,
  },
};

async function fetchWithRetry(text, cfg, customInstruction = '', retries = 3, delay = 2000) {
  const userContent = customInstruction
    ? `${text}\n\nAdditional instructions: ${customInstruction}`
    : text;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'NoteFlow',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: cfg.system },
          { role: 'user', content: userContent },
        ],
        max_tokens: cfg.max_tokens,
        temperature: cfg.temperature,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) throw new Error('No response from AI');
      return reply.trim();
    }

    if (res.status === 429 && attempt < retries) {
      const errBody = await res.text().catch(() => '');
      let wait = delay;
      try {
        const parsed = JSON.parse(errBody);
        const retryAfter = parsed?.metadata?.retry_after_seconds;
        if (retryAfter) wait = retryAfter * 1000;
      } catch {}
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    const errBody = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}): ${errBody}`);
  }
}

export async function askAI(text, action = 'expand', customInstruction = '') {
  if (!text || !text.trim()) throw new Error('No text provided');

  const cfg = CONFIGS[action] || CONFIGS.expand;
  return fetchWithRetry(text, cfg, customInstruction);
}
