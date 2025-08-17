export function buildRiskPrompt({ contract }) {
  return `
You are a contract risk reviewer. Decide if the text is likely a REAL contract or a FAKE/scam.
Explain your reasoning briefly and end with a final line:
"VERDICT: REAL" or "VERDICT: FAKE".

Contract:
"""${(contract || '').slice(0, 16000)}"""
`.trim();
}

export function buildHousingPrompt(text) {
  return `
You are a housing lease analyzer. Determine if the following text is a residential lease (rental contract).
If yes, extract key details (landlord, tenant, address, rent amount, deposit, term, dates, utilities, notice, renewal, late fees, maintenance, governing law, signatures).
Provide a concise explanation of why you believe it is a housing lease.
End with a final line: "IS_HOUSING: YES" or "IS_HOUSING: NO".

Text:
"""${(text || '').slice(0, 16000)}"""
`.trim();
}
