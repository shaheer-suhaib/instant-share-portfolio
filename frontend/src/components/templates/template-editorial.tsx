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

export function TemplateEditorial({ portfolio }: { portfolio: PortfolioRecord }) {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="grid gap-8 rounded-[36px] border border-black/8 bg-white/60 p-6 shadow-[0_30px_120px_rgba(42,34,18,0.08)] backdrop-blur lg:grid-cols-[1.35fr_0.75fr] lg:p-10">
          <div className="space-y-6">
            <Badge className="bg-[#efe0c8] text-[#8b5d33]">Template 1 • Editorial Calm</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl">
                {portfolio.name}
              </h1>
              {portfolio.title ? (
                <p className="max-w-2xl text-xl text-slate-700">{portfolio.title}</p>
              ) : null}
              {portfolio.bio ? (
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
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
          <div className="relative overflow-hidden rounded-[30px] bg-[#eadcc7] p-4">
            {portfolio.avatar_url ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
                <Image
                  src={portfolio.avatar_url}
                  alt={portfolio.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 30vw, 100vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[24px] border border-dashed border-black/10 bg-white/60 text-sm uppercase tracking-[0.22em] text-slate-500">
                Add profile photo
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 space-y-8">
          <PortfolioStats portfolio={portfolio} />

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[32px] bg-white/68 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5d33]">
                Core skills
              </p>
              <h2 className="mt-3 font-serif text-3xl">Built for fast introductions.</h2>
              <p className="mt-3 text-slate-600">
                Share the craft, the services, and the proof without asking people to dig through a resume first.
              </p>
              <div className="mt-6">
                <SkillCloud portfolio={portfolio} />
              </div>
            </section>

            <section className="rounded-[32px] bg-[#e9dfd0] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5d33]">
                Services
              </p>
              <h2 className="mt-3 font-serif text-3xl">Offerings that feel concrete.</h2>
              <div className="mt-6">
                <ServicesList portfolio={portfolio} />
              </div>
            </section>
          </div>

          <section className="rounded-[34px] bg-white/74 p-6 sm:p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5d33]">
                  Selected work
                </p>
                <h2 className="mt-3 font-serif text-3xl">Projects that show range and polish.</h2>
              </div>
            </div>
            <ProjectsGrid portfolio={portfolio} />
          </section>
        </section>
      </div>
    </main>
  );
}
