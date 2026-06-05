export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: '#000008' }}
    >
      <div
        className="h-14 w-14 rounded-full animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle at 38% 38%, #FB923C, #F97316 50%, #C2410C)',
          boxShadow: '0 0 40px rgba(249,115,22,0.5)',
        }}
      />
      <p className="font-mono text-[9px] text-text-dim tracking-[0.3em] uppercase animate-pulse">
        SYS.LOADING
      </p>
    </div>
  );
}
