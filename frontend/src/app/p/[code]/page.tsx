import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioRenderer } from "@/components/portfolio-renderer";
import { getPortfolio } from "@/lib/api";

export async function generateMetadata(props: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const result = await getPortfolio(params.code);

  if ("success" in result && result.success) {
    return {
      title: `${result.data.name} • Instant Share Portfolio`,
      description:
        result.data.bio || result.data.title || "A published portfolio from Instant Share Portfolio.",
    };
  }

  return {
    title: "Portfolio not found • Instant Share Portfolio",
  };
}

export default async function PortfolioRoute(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;
  const result = await getPortfolio(params.code);

  if ("success" in result && result.success) {
    return <PortfolioRenderer portfolio={result.data} />;
  }

  if (result.error === "Portfolio not found") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#ffffff)] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl rounded-[34px] border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
          Temporary issue
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">
          The portfolio could not load right now.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Render free instances can take a little longer after idle time. Wait a few seconds and
          refresh the page. If the issue continues, the backend may be unavailable.
        </p>
        <p className="mt-5 text-sm text-amber-700">{result.error}</p>
      </div>
    </div>
  );
}
