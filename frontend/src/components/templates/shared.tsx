import Image from "next/image";
import { Download, ExternalLink, MapPin, Mail, Phone } from "lucide-react";
import { PortfolioRecord } from "@/lib/types";
import { formatViews, pickProjectThumbnail } from "@/lib/utils";

export function PortfolioHeroMeta({ portfolio }: { portfolio: PortfolioRecord }) {
  const details = [
    { icon: Mail, text: portfolio.email },
    { icon: Phone, text: portfolio.phone },
    { icon: MapPin, text: portfolio.location },
  ].filter((item) => item.text);

  return (
    <div className="flex flex-wrap gap-3">
      {details.map((item) => {
        const Icon = item.icon;

        return (
          <span
            key={item.text}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-4 py-2 text-sm text-slate-700"
          >
            <Icon className="h-4 w-4" />
            {item.text}
          </span>
        );
      })}
    </div>
  );
}

export function ResumeButton({ resumeUrl }: { resumeUrl: string }) {
  if (!resumeUrl) {
    return null;
  }

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      <Download className="h-4 w-4" />
      Download resume
    </a>
  );
}

export function SocialLinks({ portfolio }: { portfolio: PortfolioRecord }) {
  if (!portfolio.social_links.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {portfolio.social_links.map((link) => (
        <a
          key={`${link.platform}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          <span className="capitalize">{link.platform}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

export function SkillCloud({ portfolio }: { portfolio: PortfolioRecord }) {
  if (!portfolio.skills.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {portfolio.skills.map((skill) => (
        <div
          key={`${skill.name}-${skill.category}`}
          className="rounded-3xl border border-black/10 bg-white/80 px-4 py-3"
        >
          <p className="font-medium text-slate-950">{skill.name}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {[skill.level, skill.category].filter(Boolean).join(" • ")}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ServicesList({ portfolio }: { portfolio: PortfolioRecord }) {
  if (!portfolio.services.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {portfolio.services.map((service) => (
        <article
          key={service.title}
          className="rounded-[28px] border border-black/10 bg-white/80 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-950">{service.title}</h3>
            {service.price_range ? (
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                {service.price_range}
              </span>
            ) : null}
          </div>
          {service.description ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {service.description}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ProjectsGrid({ portfolio }: { portfolio: PortfolioRecord }) {
  if (!portfolio.projects.length) {
    return null;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {portfolio.projects.map((project, index) => {
        const thumbnail = pickProjectThumbnail(project.images);

        return (
          <article
            key={`${project.title}-${index}`}
            className="overflow-hidden rounded-[30px] border border-black/10 bg-white/88"
          >
            {thumbnail ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={thumbnail.url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm uppercase tracking-[0.24em] text-slate-500">
                No project image
              </div>
            )}
            <div className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{project.title}</h3>
                  {project.description ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>
                  ) : null}
                </div>
              </div>
              {project.tech_stack.length ? (
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={`${project.title}-${tech}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Live site
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
                {project.repo_url ? (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  >
                    Source
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function PortfolioStats({ portfolio }: { portfolio: PortfolioRecord }) {
  const items = [
    { label: "Views", value: formatViews(portfolio.views) },
    { label: "Projects", value: String(portfolio.projects.length) },
    { label: "Services", value: String(portfolio.services.length) },
    { label: "Skills", value: String(portfolio.skills.length) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[24px] border border-black/10 bg-white/72 p-5"
        >
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
