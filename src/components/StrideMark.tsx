// Stride brand mark — a forward-leaning runner whose stride forms a check.
export default function StrideMark({ size = 15, color = '#06080a' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12.5" cy="4.3" r="2" fill={color} stroke="none" />
      <path d="M12 6.6 L8.8 12 L12.5 13.5 L12 19" />
      <path d="M8.8 12 L5.5 15" />
      <path d="M10.6 8.6 L14.6 10" />
      <path d="M13.6 17.4 l2.3 2.3 L20.4 14" />
    </svg>
  )
}
