// Builds a human-readable case id like "FIR-2024-089" or "CMP-2024-112",
// matching the format used across the frontend.
function generateCaseId(prefix, seq) {
  const year = new Date().getFullYear();
  const safePrefix = prefix === 'CMP' ? 'CMP' : 'FIR';
  const padded = String(seq).padStart(3, '0');
  return `${safePrefix}-${year}-${padded}`;
}

module.exports = { generateCaseId };
