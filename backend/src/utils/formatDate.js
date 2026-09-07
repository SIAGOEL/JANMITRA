// Matches the frontend's display format:
//   new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
// e.g. "Aug 26, 2026"
function formatDisplayDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

module.exports = { formatDisplayDate };
