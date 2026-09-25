/**
 * Contact details.
 *
 * ⚠ CONFIRM BEFORE LAUNCH — `email` and `phone` below are the only two values
 * on the public site that were not derived from the codebase. The domain is
 * taken from weddingphotoplanet.com, which appears throughout the app, but the
 * mailbox and number must be confirmed by the business. Nothing else on the
 * marketing surface invents a fact.
 */
export const contactChannels = [
  { label: 'Email', value: 'hello@weddingphotoplanet.com', href: 'mailto:hello@weddingphotoplanet.com' },
  { label: 'Phone', value: '+91 98765 00001', href: 'tel:+919876500001' },
];

/** Every destination here is a route that already exists in the app. */
export const contactDoors = [
  {
    index: '01',
    title: 'You run a studio',
    description:
      'Ask for access to the CRM, or sign in if your studio is already set up. We will walk through leads, projects, shoots and payments with you.',
    href: '/login',
    cta: 'Sign in to the CRM',
  },
  {
    index: '02',
    title: 'You freelance',
    description:
      'Register your interest as a photographer, cinematographer or editor. Studios already track freelancer assignments and payouts in the CRM.',
    href: '/freelancers',
    cta: 'View freelancer page',
  },
  {
    index: '03',
    title: 'You are getting married',
    description:
      'Your photographs come from your studio, not from us. If you are waiting on a gallery, your studio is the fastest way to reach it.',
    href: '/client/login',
    cta: 'Client sign-in',
  },
];
