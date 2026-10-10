export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinning spice bowl */}
        <div className="relative w-16 h-16">
          <div
            className="w-16 h-16 rounded-full border-4 animate-spin"
            style={{
              borderColor: "var(--brand-red)",
              borderTopColor: "transparent",
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            🌶️
          </span>
        </div>
        <p
          className="text-sm font-semibold tracking-wider uppercase animate-pulse"
          style={{ color: "var(--text-muted)" }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
