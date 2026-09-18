import Image from 'next/image';
import { LandingSection, SectionHeader } from './SectionChrome';

export function GalleryShowcase() {
  return (
    <LandingSection className="bg-[#302C2E] text-white">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <SectionHeader
          eyebrow="Gallery Showcase"
          title="A future client experience with editorial calm."
          description="This section uses the available local wedding image as a replaceable brand asset placeholder. Final gallery imagery should be replaced with approved Wedding Photo Planet portfolio assets."
          tone="dark"
        />
        <div className="grid grid-cols-6 gap-3">
          <div className="relative col-span-6 aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/10 md:col-span-4 md:row-span-2 md:aspect-auto">
            <Image src="/images/wedding-login-hero.png" alt="Editorial wedding gallery preview" fill sizes="(min-width: 1024px) 46vw, 92vw" className="object-cover transition duration-700 hover:scale-105" />
          </div>
          {[0, 1].map((item) => (
            <div key={item} className="relative col-span-3 aspect-square overflow-hidden rounded-[1.4rem] border border-white/10 md:col-span-2">
              <Image src="/images/wedding-login-hero.png" alt="Supporting wedding gallery preview" fill sizes="(min-width: 768px) 18vw, 44vw" className={`object-cover transition duration-700 hover:scale-105 ${item === 0 ? 'object-left' : 'object-right'}`} />
            </div>
          ))}
          <div className="col-span-6 rounded-[1.4rem] border border-white/10 bg-white/8 p-5 md:col-span-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#DDC89C]">Replaceable Assets</p>
            <p className="mt-3 text-sm font-medium leading-6 text-[#E8DDD7]">
              Final production should use real approved wedding portfolio images, optimized for thumbnails and full gallery viewing.
            </p>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
