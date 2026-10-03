// Maps an authored label such as "Fictional dialogue" to its tag kind.
export function kindForLabel(label) {
  if (label === 'Historical source') return 'source'
  if (label === 'Interpretation' || label === 'Interpretive task') return 'interpretation'
  if (label === 'Not recorded') return 'unknown'
  if (label === 'Modern reconstruction') return 'reconstruction'
  return 'fiction'
}
