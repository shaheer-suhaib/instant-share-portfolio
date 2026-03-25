export default function PortfolioLoading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#ffffff)] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-72 rounded-[36px] bg-slate-200" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48 rounded-[30px] bg-slate-200" />
          <div className="h-48 rounded-[30px] bg-slate-200" />
        </div>
        <div className="h-96 rounded-[32px] bg-slate-200" />
      </div>
    </div>
  );
}
