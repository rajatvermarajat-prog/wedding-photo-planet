/** Three access tiers the product is structured around. Prices are deliberately
 *  unset: no number is published until commercial terms are agreed. */
export const pricingPlans = [
  {
    name: 'Studio',
    label: 'The workspace',
    price: 'Quoted',
    priceNote: 'by studio volume',
    description:
      'The full CRM for a studio and its internal team: leads, projects, shoots, crew, freelancers, payments and reporting.',
    cta: 'Open the CRM',
    href: '/dashboard',
    features: ['Nine live modules', 'Role-based access', 'Freelancer + payout tracking', 'Dashboards and reporting'],
    highlighted: true,
  },
  {
    name: 'Freelancer',
    label: 'The profile',
    price: 'To be set',
    priceNote: 'portal in build',
    description:
      'For photographers, cinematographers and editors who want one profile, visible assignments and their own payout history.',
    cta: 'Join as a freelancer',
    href: '/freelancer/join',
    features: ['Professional profile', 'Portfolio and availability', 'Assignment visibility', 'Payout history'],
    highlighted: false,
  },
  {
    name: 'Client',
    label: 'The gallery',
    price: 'Included',
    priceNote: 'with the studio',
    description:
      'For the couple and their family. Never billed to the client — it arrives as part of what the studio delivers.',
    cta: 'See the client experience',
    href: '/client/projects',
    features: ['Project access', 'Albums and galleries', 'Favourites and downloads', 'Sharing when permitted'],
    highlighted: false,
  },
];
