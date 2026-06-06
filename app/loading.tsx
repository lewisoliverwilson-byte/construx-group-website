export default function Loading() {
  const lines = [
    { text: 'construx.runtime — initialising', delay: '0ms', dim: true },
    { text: 'Loading AI module manifests...', delay: '120ms', dim: true },
    { text: 'Connecting to venture fleet...', delay: '240ms', dim: true },
    { text: 'Building static payload...', delay: '360ms', dim: false },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: '#000008' }}
    >
      {/* Terminal panel */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'rgba(3,3,14,0.97)',
          border: '1px solid rgba(249,115,22,0.15)',
          borderRadius: '6px',
          boxShadow: '0 0 40px rgba(249,115,22,0.05), 0 16px 48px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(249,115,22,0.08)',
            background: 'rgba(249,115,22,0.02)',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(249,115,22,0.4)',
              flex: 1,
              textAlign: 'center',
            }}
          >
            construx/runtime — boot
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* Orb */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div
              className="animate-glow-pulse"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 38%, #FB923C, #F97316 50%, #C2410C)',
                boxShadow: '0 0 30px rgba(249,115,22,0.5)',
              }}
            />
          </div>

          {/* Log lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {lines.map((line, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  animationDelay: line.delay,
                  animationFillMode: 'both',
                  display: 'flex',
                  gap: '12px',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: '10px',
                }}
              >
                <span style={{ color: 'rgba(249,115,22,0.5)', flexShrink: 0 }}>{'>'}</span>
                <span
                  style={{
                    color: line.dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {line.text}
                </span>
              </div>
            ))}
            {/* Blinking cursor line */}
            <div
              className="animate-fade-in"
              style={{
                animationDelay: '480ms',
                animationFillMode: 'both',
                display: 'flex',
                gap: '12px',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: '10px',
                marginTop: '2px',
              }}
            >
              <span style={{ color: 'rgba(249,115,22,0.5)', flexShrink: 0 }}>{'>'}</span>
              <span
                className="animate-pulse"
                style={{ color: 'rgba(249,115,22,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '9px' }}
              >
                SYS.LOADING
              </span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 16px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '8px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: 'rgba(249,115,22,0.3)' }}>construx@sys</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>boot:0</span>
        </div>
      </div>
    </div>
  );
}
