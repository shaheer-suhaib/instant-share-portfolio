import Image from "next/image";
import { Badge } from "@/components/ui";
import {
  PortfolioHeroMeta,
  PortfolioStats,
  ProjectsGrid,
  ResumeButton,
  ServicesList,
  SkillCloud,
  SocialLinks,
} from "@/components/templates/shared";
import { PortfolioRecord } from "@/lib/types";

export function TemplateProfessional({ portfolio }: { portfolio: PortfolioRecord }) {
  return (
    <main className="min-h-screen bg-[#eef3f8] text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-6 rounded-[36px] bg-slate-950 p-6 text-white sm:p-8">
            <Badge className="bg-white/10 text-white">Template 3 • Professional Grid</Badge>
            <div className="relative overflow-hidden rounded-[28px] bg-white/6 p-4">
              {portfolio.avatar_url ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                  <Image
                    src={portfolio.avatar_url}
                    alt={portfolio.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 24vw, 100vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-[22px] border border-dashed border-white/20 text-sm uppercase tracking-[0.24em] text-slate-400">
                  Profile image
                </div>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Portfolio code</p>
              <p className="mt-2 text-3xl font-semibold tracking-[0.18em]">{portfolio.code}</p>
            </div>
            <PortfolioHeroMeta portfolio={portfolio} />
            <ResumeButton resumeUrl={portfolio.resume_url} />
            <SocialLinks portfolio={portfolio} />
          </aside>

          <div className="space-y-8">
            <section className="rounded-[36px] bg-white p-6 shadow-[0_20px_80px_rgba(19,38,74,0.08)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                Executive summary
              </p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl">
                {portfolio.name}
              </h1>
              {portfolio.title ? (
                <p className="mt-4 text-xl text-slate-700">{portfolio.title}</p>
              ) : null}
              {portfolio.bio ? (
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {portfolio.bio}
                </p>
              ) : null}
            </section>

            <PortfolioStats portfolio={portfolio} />

            <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[34px] bg-white p-6 shadow-[0_20px_80px_rgba(19,38,74,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                  Skill matrix
                </p>
                <div className="mt-6">
                  <SkillCloud portfolio={portfolio} />
                </div>
              </div>
              <div className="rounded-[34px] bg-white p-6 shadow-[0_20px_80px_rgba(19,38,74,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                  Services
                </p>
                <div className="mt-6">
                  <ServicesList portfolio={portfolio} />
                </div>
              </div>
            </section>

            <section className="rounded-[34px] bg-white p-6 shadow-[0_20px_80px_rgba(19,38,74,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
                Case studies
              </p>
              <div className="mt-6">
                <ProjectsGrid portfolio={portfolio} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
