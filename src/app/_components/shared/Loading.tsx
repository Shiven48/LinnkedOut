export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full animate-spin border-4 border-[var(--col-dark-golden)] border-t-transparent shadow-[0_0_15px_rgba(227,236,88,0.2)]"></div>
        <p className="text-[var(--col-dark-golden)] font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}