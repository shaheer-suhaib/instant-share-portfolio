import { PortfolioRecord } from "@/lib/types";
import { TemplateEditorial } from "@/components/templates/template-editorial";
import { TemplateCreative } from "@/components/templates/template-creative";
import { TemplateProfessional } from "@/components/templates/template-professional";

export function PortfolioRenderer({ portfolio }: { portfolio: PortfolioRecord }) {
  if (portfolio.template_id === 2) {
    return <TemplateCreative portfolio={portfolio} />;
  }

  if (portfolio.template_id === 3) {
    return <TemplateProfessional portfolio={portfolio} />;
  }

  return <TemplateEditorial portfolio={portfolio} />;
}
