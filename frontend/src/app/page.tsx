import Link from "next/link";
import { ArrowRight, Check, LayoutTemplate, Rocket, Upload } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge, Button, Card, SectionHeading, Shell } from "@/components/ui";
import { TEMPLATE_OPTIONS } from "@/lib/constants";

const features = [
  {
    icon: Upload,
    title: "Upload once, publish everywhere",
    body: "Profile photos, resume PDFs, and project screenshots go through your existing backend and come back ready for every template.",
  },
  {
    icon: LayoutTemplate,
    title: "Three templates with actual personality",
    body: "Editorial calm, creative pulse, and professional grid each feel different on purpose instead of looking like the same layout in new colors.",
  },
  {
    icon: Rocket,
    title: "Share with one short code",
    body: "The backend returns a compact public code so users can send a live portfolio page in seconds.",
  },
];

const workflow = [
  "Enter profile details, services, skills, social links, and project stories.",
  "Upload the image and PDF assets straight into Cloudinary through your live backend.",
  "Pick one of the three templates and publish to get the shareable code.",
  "Open the public portfolio at `/p/[code]` and send it anywhere.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(180deg,_#fffef9,_#f8fbff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.08),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.1),_transparent_22%),linear-gradient(180deg,_#08111f,_#0f172a)]">
      <SiteHeader />
      <main>
        <Shell className="py-10 sm:py-14">
          <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Badge>Instant portfolio sharing</Badge>
              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.92] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                  Build a polished portfolio page and share it with one short code.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                  Instant Share Portfolio turns your existing backend into a fast portfolio builder:
                  enter the details, upload the assets, choose a template, and publish to a public share page.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/create">
                  <Button className="gap-2">
                    Start building
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#templates">
                  <Button variant="secondary">See templates</Button>
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Templates" value="3" />
                <Stat label="Share flow" value="1 code" />
                <Stat label="Backend" value="Live on Render" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Card className="!bg-slate-950 text-white sm:translate-y-10">
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Builder</p>
                <p className="mt-4 text-2xl font-semibold">Guided wizard</p>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Eight steps, clear validation, asset uploads, and a publish screen that maps directly to your API.
                </p>
              </Card>
              <Card className="bg-[linear-gradient(135deg,#f7f1e8,#e8f5ff)] dark:bg-[linear-gradient(135deg,#1e293b,#0f172a)]">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">Share page</p>
                <p className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Public route</p>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  Every created portfolio is viewable at a clean route like `/p/a1b2c3d4`.
                </p>
              </Card>
              <Card className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">Built for your stack</p>
                <p className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">
                  Next.js on Vercel, powered by your Render API.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                  The frontend uses your already deployed backend at
                  ` https://instant-share-portfolio.onrender.com ` for uploads and portfolio publishing.
                </p>
              </Card>
            </div>
          </section>
        </Shell>

        <section id="features" className="py-12 sm:py-16">
          <Shell>
            <SectionHeading
              eyebrow="Why it works"
              title="A small SaaS flow that feels fast and intentional."
              body="The frontend is designed to feel closer to a product than a form dump: better pacing, stronger visual choices, and cleaner publishing feedback."
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                    <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{feature.body}</p>
                  </Card>
                );
              })}
            </div>
          </Shell>
        </section>

        <section id="templates" className="py-12 sm:py-16">
          <Shell>
            <SectionHeading
              eyebrow="Templates"
              title="Three looks, three different moods."
              body="Users should feel like they are choosing a direction, not simply toggling a card style."
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {TEMPLATE_OPTIONS.map((template) => (
                <Card key={template.id} className="overflow-hidden p-0">
                  <div
                    className={`h-44 ${
                      template.id === 1
                        ? "bg-[linear-gradient(135deg,#f7f1e8,#ebdcc8)]"
                        : template.id === 2
                          ? "bg-[linear-gradient(135deg,#0f172a,#f97316_65%,#2dd4bf)]"
                          : "bg-[linear-gradient(135deg,#dbeafe,#ffffff,#e2e8f0)]"
                    }`}
                  />
                  <div className="space-y-3 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">
                      {template.name}
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">{template.label}</h3>
                    <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{template.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Shell>
        </section>

        <section id="workflow" className="py-12 sm:py-16">
          <Shell>
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <SectionHeading
                eyebrow="Workflow"
                title="A simple path from details to a live portfolio."
                body="The frontend follows the same order your backend already expects, so implementation stays straightforward and the user journey still feels polished."
              />
              <Card className="space-y-4">
                {workflow.map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </Card>
            </div>
          </Shell>
        </section>

        <section className="pb-12 sm:pb-18">
          <Shell>
            <Card className="!bg-slate-950 text-white">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                    Ready to build
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                    Start the wizard and publish the first share link today.
                  </h2>
                </div>
                <Link href="/create">
                  <Button variant="secondary" className="gap-2">
                    Open builder
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </Shell>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-900/78">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
