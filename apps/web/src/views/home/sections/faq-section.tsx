import { SectionHeading } from "@/components/section-heading";
import { faqItems } from "@/content/homepage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui/components/accordion";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-8 container py-24"
      aria-labelledby="faq-title"
    >
      <SectionHeading
        id="faq-title"
        title="Frequently asked questions"
        description="The practical details about where Ordito runs and what it keeps."
      />
      <Accordion className="max-w-3xl">
        {faqItems.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="py-4 text-base font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl pb-4 leading-7 text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
