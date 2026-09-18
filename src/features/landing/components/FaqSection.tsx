'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../data/faqData';
import { LandingSection, SectionHeader } from './SectionChrome';

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <LandingSection id="faq" className="bg-[#F0EDE9]">
      <SectionHeader
        eyebrow="FAQ"
        title="Questions before the next phase"
        description="Answers reflect what exists today and what is planned, without promising unfinished backend functionality."
        align="center"
      />
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-[#DFD9D2] overflow-hidden rounded-[1.75rem] border border-[#DFD9D2] bg-white">
        {faqs.map((faq, index) => {
          const expanded = open === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-black text-[#302C2E]"
                aria-expanded={expanded}
              >
                {faq.question}
                <ChevronDown className={`size-4 shrink-0 text-[#8D5265] transition ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm font-medium leading-7 text-[#686164]">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </LandingSection>
  );
}
