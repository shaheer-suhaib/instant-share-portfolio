"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Copy, LoaderCircle, Sparkles } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { createPortfolio, uploadImage, uploadResume } from "@/lib/api";
import { defaultPortfolioValues, TEMPLATE_OPTIONS, WIZARD_STEPS } from "@/lib/constants";
import { portfolioSchema, type PortfolioFormValues } from "@/lib/schemas";
import { Button, Card, SectionHeading, Shell } from "@/components/ui";
import {
  BasicsStep,
  MediaStep,
  ProjectsStep,
  ReviewStep,
  ServicesStep,
  SkillsStep,
  SocialLinksStep,
  SummaryItem,
  TemplateStep,
} from "@/components/builder-sections";

const STEP_FIELDS: Record<number, Parameters<ReturnType<typeof useForm<PortfolioFormValues>>["trigger"]>[0]> = {
  0: ["name", "title", "bio", "email", "phone", "location"],
  1: ["avatar_url", "resume_url"],
  2: "skills",
  3: "services",
  4: "social_links",
  5: "projects",
  6: ["template_id"],
  7: undefined,
};

const STEP_INTRO = [
  {
    title: "Start with the essentials",
    body: "Introduce the person behind the portfolio so the templates can carry a real voice, not just a list of facts.",
  },
  {
    title: "Upload the assets once",
    body: "We send profile photos, resume PDFs, and project images to Cloudinary through your live backend as soon as they are selected.",
  },
  {
    title: "Show the strengths clearly",
    body: "Capture what this person is good at in a way that looks sharp across all three templates.",
  },
  {
    title: "Make the offer concrete",
    body: "Services turn the portfolio into something useful for outreach, freelance, and job opportunities.",
  },
  {
    title: "Give people somewhere to go",
    body: "Social links turn the share page into a launchpad for GitHub, LinkedIn, Behance, and beyond.",
  },
  {
    title: "Add proof, not promises",
    body: "Projects carry the screenshots, links, and tech stack that make the portfolio feel credible right away.",
  },
  {
    title: "Choose the visual direction",
    body: "Each template is intentionally different, so the user can pick a mood that matches their work.",
  },
  {
    title: "Review before publish",
    body: "This final step assembles the exact payload the backend already expects and turns it into a shareable code.",
  },
] as const;

type UploadState = {
  avatar: boolean;
  resume: boolean;
  projectImagePath: string | null;
};

type WatchedPortfolioValues = {
  template_id?: PortfolioFormValues["template_id"];
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  resume_url?: string;
  skills?: Array<Partial<PortfolioFormValues["skills"][number]>>;
  services?: Array<Partial<PortfolioFormValues["services"][number]>>;
  social_links?: Array<Partial<PortfolioFormValues["social_links"][number]>>;
  projects?: Array<
    Partial<PortfolioFormValues["projects"][number]> & {
      images?: Array<Partial<PortfolioFormValues["projects"][number]["images"][number]>>;
    }
  >;
};

function normalizeValues(
  watchedValues: WatchedPortfolioValues | undefined
): PortfolioFormValues {
  return {
    ...defaultPortfolioValues,
    ...watchedValues,
    skills: (watchedValues?.skills ?? defaultPortfolioValues.skills).map((skill) => ({
      name: skill.name ?? "",
      level: skill.level ?? "advanced",
      category: skill.category ?? "",
    })),
    services: (watchedValues?.services ?? defaultPortfolioValues.services).map((service) => ({
      title: service.title ?? "",
      description: service.description ?? "",
      price_range: service.price_range ?? "",
    })),
    social_links: (
      watchedValues?.social_links ?? defaultPortfolioValues.social_links
    ).map((link) => ({
      platform: link.platform ?? "website",
      url: link.url ?? "",
    })),
    projects: (watchedValues?.projects ?? defaultPortfolioValues.projects).map((project) => ({
      title: project.title ?? "",
      description: project.description ?? "",
      tech_stack: project.tech_stack ?? [],
      live_url: project.live_url ?? "",
      repo_url: project.repo_url ?? "",
      images: (project.images ?? []).map((image) => ({
        url: image.url ?? "",
        is_thumbnail: image.is_thumbnail ?? false,
      })),
    })),
  };
}

export function BuilderWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    avatar: false,
    resume: false,
    projectImagePath: null,
  });
  const [isPending, startTransition] = useTransition();

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: defaultPortfolioValues,
    mode: "onBlur",
  });

  const { control, getValues, handleSubmit, setValue, trigger } = form;
  const skills = useFieldArray({ control, name: "skills" });
  const services = useFieldArray({ control, name: "services" });
  const socialLinks = useFieldArray({ control, name: "social_links" });
  const projects = useFieldArray({ control, name: "projects" });
  const watchedValues = useWatch({ control, defaultValue: defaultPortfolioValues });
  const values = useMemo(
    () => normalizeValues(watchedValues as WatchedPortfolioValues | undefined),
    [watchedValues]
  );

  const completeness = useMemo(() => {
    const score = [
      values.name.trim().length > 1,
      Boolean(values.avatar_url || values.resume_url),
      values.skills.some((skill) => skill.name.trim()),
      values.services.some((service) => service.title.trim()),
      values.social_links.some((link) => link.url.trim()),
      values.projects.some((project) => project.title.trim()),
      Boolean(values.template_id),
    ].filter(Boolean).length;

    return Math.round((score / 7) * 100);
  }, [values]);

  const selectedTemplate = TEMPLATE_OPTIONS.find(
    (template) => template.id === values.template_id
  );

  async function handleNext() {
    const valid = await trigger(STEP_FIELDS[currentStep], { shouldFocus: true });
    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, WIZARD_STEPS.length - 1));
    }
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleCopyPreview() {
    await navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function handleUpload(kind: "avatar" | "resume", file: File) {
    setSubmitError("");
    setUploadState((state) => ({ ...state, [kind]: true }));

    const result = kind === "avatar" ? await uploadImage(file) : await uploadResume(file);

    setUploadState((state) => ({ ...state, [kind]: false }));

    if ("success" in result && result.success) {
      setValue(kind === "avatar" ? "avatar_url" : "resume_url", result.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    setSubmitError(result.error);
  }

  async function handleUploadProjectImage(file: File, projectIndex: number) {
    setSubmitError("");
    setUploadState((state) => ({
      ...state,
      projectImagePath: `projects.${projectIndex}.images`,
    }));

    const result = await uploadImage(file);

    setUploadState((state) => ({
      ...state,
      projectImagePath: null,
    }));

    if ("success" in result && result.success) {
      const currentImages = getValues(`projects.${projectIndex}.images`);
      setValue(
        `projects.${projectIndex}.images`,
        [
          ...currentImages,
          {
            url: result.url,
            is_thumbnail: currentImages.length === 0,
          },
        ],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
      return;
    }

    setSubmitError(result.error);
  }

  function removeProjectImage(projectIndex: number, imageIndex: number) {
    const currentImages = getValues(`projects.${projectIndex}.images`);
    const nextImages = currentImages.filter((_, index) => index !== imageIndex);
    if (nextImages.length > 0 && !nextImages.some((image) => image.is_thumbnail)) {
      nextImages[0] = { ...nextImages[0], is_thumbnail: true };
    }
    setValue(`projects.${projectIndex}.images`, nextImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setProjectThumbnail(projectIndex: number, imageIndex: number) {
    const nextImages = getValues(`projects.${projectIndex}.images`).map((image, index) => ({
      ...image,
      is_thumbnail: index === imageIndex,
    }));
    setValue(`projects.${projectIndex}.images`, nextImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const onSubmit = handleSubmit((rawValues) => {
    const payload = {
      ...rawValues,
      title: rawValues.title.trim(),
      bio: rawValues.bio.trim(),
      email: rawValues.email.trim(),
      phone: rawValues.phone.trim(),
      location: rawValues.location.trim(),
      avatar_url: rawValues.avatar_url.trim(),
      resume_url: rawValues.resume_url.trim(),
      skills: rawValues.skills.filter((skill) => skill.name.trim()),
      services: rawValues.services.filter((service) => service.title.trim()),
      social_links: rawValues.social_links.filter((link) => link.url.trim()),
      projects: rawValues.projects
        .filter((project) => project.title.trim())
        .map((project) => ({
          ...project,
          tech_stack: project.tech_stack.filter(Boolean),
        })),
    };

    setSubmitError("");
    startTransition(async () => {
      const result = await createPortfolio(payload);
      if ("success" in result && result.success) {
        router.push(`/created/${result.code}`);
        return;
      }
      setSubmitError(result.error);
    });
  });

  return (
    <Shell className="py-8 sm:py-12">
      <div className="grid items-start gap-8 xl:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="!bg-slate-950 text-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  <Sparkles className="h-4 w-4" />
                  Guided builder
                </span>
                <span className="text-sm text-white/70">{completeness}% ready</span>
              </div>
              <SectionHeading
                eyebrow="Portfolio setup"
                title={STEP_INTRO[currentStep].title}
                body={STEP_INTRO[currentStep].body}
                invert
              />
              <div className="space-y-3">
                {WIZARD_STEPS.map((label, index) => (
                  <div
                    key={label}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                      index === currentStep
                        ? "bg-white text-slate-950"
                        : index < currentStep
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-white/10 text-white/60"
                    }`}
                  >
                    {index < currentStep ? "Done • " : ""}
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Live summary
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  What the share page already knows
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyPreview}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950 dark:border-white/12 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy site URL"}
              </button>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/70">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">
                {values.name || "Your portfolio name"}
              </p>
              <p className="mt-2 text-slate-700 dark:text-slate-300">
                {values.title || "A clear role or specialty helps the templates feel stronger."}
              </p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <SummaryItem label="Projects" value={String(values.projects.length)} />
                <SummaryItem label="Skills" value={String(values.skills.length)} />
                <SummaryItem label="Services" value={String(values.services.length)} />
                <SummaryItem label="Template" value={selectedTemplate?.label ?? "Not selected"} />
              </dl>
            </div>
          </Card>
        </aside>

        <Card className="overflow-hidden p-0">
          <form onSubmit={onSubmit}>
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Step {currentStep + 1}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                {WIZARD_STEPS[currentStep]}
              </h1>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="space-y-8 px-6 py-6 sm:px-8 sm:py-8"
            >
              {currentStep === 0 ? <BasicsStep form={form} /> : null}
              {currentStep === 1 ? (
                <MediaStep form={form} uploadState={uploadState} onUpload={handleUpload} />
              ) : null}
              {currentStep === 2 ? (
                <SkillsStep
                  form={form}
                  skills={skills}
                  services={services}
                  socialLinks={socialLinks}
                  projects={projects}
                />
              ) : null}
              {currentStep === 3 ? (
                <ServicesStep
                  form={form}
                  skills={skills}
                  services={services}
                  socialLinks={socialLinks}
                  projects={projects}
                />
              ) : null}
              {currentStep === 4 ? (
                <SocialLinksStep
                  form={form}
                  skills={skills}
                  services={services}
                  socialLinks={socialLinks}
                  projects={projects}
                />
              ) : null}
              {currentStep === 5 ? (
                <ProjectsStep
                  form={form}
                  skills={skills}
                  services={services}
                  socialLinks={socialLinks}
                  projects={projects}
                  uploadState={uploadState}
                  onUploadProjectImage={handleUploadProjectImage}
                  onRemoveProjectImage={removeProjectImage}
                  onSetProjectThumbnail={setProjectThumbnail}
                />
              ) : null}
              {currentStep === 6 ? <TemplateStep form={form} /> : null}
              {currentStep === 7 ? <ReviewStep form={form} /> : null}

              {submitError ? (
                <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  {submitError}
                </div>
              ) : null}
            </motion.div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isPending}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Link href="/">
                  <Button variant="ghost">Exit builder</Button>
                </Link>
              </div>

              {currentStep < WIZARD_STEPS.length - 1 ? (
                <Button className="gap-2" onClick={handleNext} disabled={isPending}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-2" disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Publishing
                    </>
                  ) : (
                    <>
                      Publish portfolio
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
