import { notFound } from 'next/navigation';
import { Action, Display, RuleList, Section, SectionMark, TextLink } from '@/features/landing/components/Editorial';
import { PageHeader } from '@/features/landing/components/PageHeader';
import { Reveal } from '@/features/landing/components/Reveal';
import { services } from '@/features/landing/data/serviceContent';

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug];
  if (!service) return { title: 'Service' };
  return { title: service.title, description: service.lead };
}

/**
 * Service detail.
 *
 * The previous version accepted any slug and de-hyphenated it into a
 * placeholder heading, which meant /services/anything-at-all rendered a page.
 * Unknown slugs now 404 properly; the known set is small and explicit.
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug];
  if (!service) notFound();

  return (
    <>
      <PageHeader mark={`Services · ${service.mark}`} title={service.title} lead={service.lead}>
        <Action href="/contact">Talk about a booking</Action>
      </PageHeader>

      <Section tone="paper">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionMark index="01" label="What it covers" />
            </Reveal>
            <Reveal delay={80}>
              <RuleList items={service.includes} />
            </Reveal>
          </div>

          <Reveal delay={160} className="lg:col-span-5 lg:col-start-8">
            <Display step="ed-d3" className="max-w-[20ch] text-[var(--ed-on-paper)]">
              {service.note.heading}
            </Display>
            <p className="mt-5 text-[0.875rem] leading-[1.78] text-[var(--ed-on-paper-dim)]">{service.note.body}</p>
            <div className="mt-8">
              <TextLink href="/#capabilities">How this is tracked in the CRM</TextLink>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
