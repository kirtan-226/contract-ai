// Simple template matching by keywords/cosine-lite. Replace with real embeddings later.

const TEMPLATES = [
  { name: 'Residential Lease', keys: ['tenant','landlord','rent','lease term','security deposit','premises'] },
  { name: 'NDA', keys: ['confidential','disclosing party','receiving party','non-disclosure','trade secret'] },
  { name: 'Service Agreement', keys: ['scope of work','payment terms','deliverables','termination'] },
];

export function matchTemplates(text) {
  const t = text.toLowerCase();
  let best = { name: null, score: 0 };
  for (const tpl of TEMPLATES) {
    const hits = tpl.keys.reduce((n, k) => n + (t.includes(k.toLowerCase()) ? 1 : 0), 0);
    const score = hits / tpl.keys.length;
    if (score > best.score) best = { name: tpl.name, score };
  }
  return best.name ? best : null;
}
