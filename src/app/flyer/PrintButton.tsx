'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: '#ff6b00',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        padding: '10px 28px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.2px',
      }}
    >
      🖨️ &nbsp;طباعة / Print
    </button>
  )
}
