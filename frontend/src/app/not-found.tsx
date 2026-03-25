import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, Card, Shell } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfffd,#f8fbff)] dark:bg-[linear-gradient(180deg,#08111f,#0f172a)]">
      <div className="flex justify-end px-5 pt-5 sm:px-8">
        <ThemeToggle />
      </div>
      <Shell className="flex min-h-screen items-center py-8">
        <Card className="mx-auto w-full max-w-2xl p-8 text-center sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            Not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950 dark:text-white">
            This portfolio link does not exist.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">
            The code may be wrong, the portfolio may have been deleted, or the link may be out of date.
          </p>
          <Link href="/" className="mt-8 inline-flex">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </Card>
      </Shell>
    </div>
  );
}
