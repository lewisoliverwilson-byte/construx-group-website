export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--paper)' }}
    >
      <span className="reg-mark animate-fade-in" style={{ transform: 'scale(1.4)' }} />
      <p className="t-meta animate-fade-in">Loading</p>
    </div>
  );
}
