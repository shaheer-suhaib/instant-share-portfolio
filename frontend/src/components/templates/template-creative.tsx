import Image from "next/image";
import { Badge } from "@/components/ui";
import {
  PortfolioHeroMeta,
  ProjectsGrid,
  ResumeButton,
  ServicesList,
  SkillCloud,
  SocialLinks,
} from "@/components/templates/shared";
import { PortfolioRecord } from "@/lib/types";

export function TemplateCreative({ portfolio }: { portfolio: PortfolioRecord }) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(253,186,116,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.25),_transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 rounded-[36px] border border-white/10 bg-white/8 p-6 backdrop-blur sm:p-8">
              <Badge className="bg-orange-300/15 text-orange-200">
                Template 2 • Creative Pulse
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] tracking-tight sm:text-7xl">
                  {portfolio.name}
                </h1>
                {portfolio.title ? (
                  <p className="max-w-2xl text-xl text-slate-200">{portfolio.title}</p>
                ) : null}
                {portfolio.bio ? (
                  <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                    {portfolio.bio}
                  </p>
                ) : null}
              </div>
              <PortfolioHeroMeta portfolio={portfolio} />
              <div className="flex flex-wrap gap-3">
                <ResumeButton resumeUrl={portfolio.resume_url} />
              </div>
              <SocialLinks portfolio={portfolio} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[34px] bg-[#f97316] p-6 text-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                  Live share code
                </p>
                <p className="mt-6 text-4xl font-semibold tracking-[0.18em]">
                  {portfolio.code}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-900/80">
                  A compact public link for pitching, applying, or sending work in seconds.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-4">
                {portfolio.avatar_url ? (
                  <div className="relative h-full min-h-[280px] overflow-hidden rounded-[24px]">
                    <Image
                      src={portfolio.avatar_url}
                      alt={portfolio.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 24vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-white/20 bg-white/5 text-sm uppercase tracking-[0.24em] text-slate-300">
                    Profile image
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="space-y-8">
              <section className="rounded-[34px] border border-white/10 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
                  Skills
                </p>
                <h2 className="mt-3 text-3xl font-semibold">Tools that keep the work sharp.</h2>
                <div className="mt-6">
                  <SkillCloud portfolio={portfolio} />
                </div>
              </section>

              <section className="rounded-[34px] border border-white/10 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
                  Services
                </p>
                <div className="mt-6">
                  <ServicesList portfolio={portfolio} />
                </div>
              </section>
            </div>

            <section className="rounded-[34px] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                Project gallery
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Built to feel alive before the call even starts.</h2>
              <div className="mt-6">
                <ProjectsGrid portfolio={portfolio} />
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
