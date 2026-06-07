import Link from "next/link";
import type { CtaData } from "./def";
import { Section } from "@/components/public/Section";
import { Reveal } from "@/components/public/Reveal";
import { ContactForm } from "@/components/public/ContactForm";

export function CtaRender({ data }: { data: CtaData }) {
  return (
    <Section width="normal">
      <Reveal>
        <div className="rounded-2xl border border-bg-border bg-gradient-to-b from-accent/10 to-bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{data.title}</h2>
          {data.text ? <p className="mx-auto mt-3 max-w-xl text-fg-muted">{data.text}</p> : null}
          {data.useContactForm ? (
            <div className="mx-auto mt-6 max-w-md text-left">
              <ContactForm source="cta" compact />
            </div>
          ) : (
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90"
              >
                {data.buttonLabel}
              </Link>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
