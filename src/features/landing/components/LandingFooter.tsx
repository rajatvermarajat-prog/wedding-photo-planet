import Link from 'next/link';

const footerGroups = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#studios', label: 'For Studios' },
      { href: '#freelancers', label: 'For Freelancers' },
      { href: '#clients', label: 'For Clients' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/', label: 'About' },
      { href: '#contact', label: 'Contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[#DFD9D2] bg-[#F7F6F3]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div>
          <Link href="/" className="text-base font-black text-[#302C2E]">Wedding Photo Planet</Link>
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-[#686164]">
            A warm, professional ecosystem for wedding photography operations, freelancers and client memories.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-black uppercase tracking-[.14em] text-[#8D5265]">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-semibold text-[#686164] hover:text-[#5A2F3E]">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[#DFD9D2] px-4 py-5 text-center text-xs font-bold text-[#686164]">
        © Wedding Photo Planet
      </div>
    </footer>
  );
}
