/**
 * Service detail content.
 *
 * Scoped to the service types the CRM's own project records already use
 * (primaryServiceType), so the marketing pages and the operational data speak
 * about the same work. Unknown slugs 404 rather than rendering a placeholder.
 */
type Service = {
  mark: string;
  title: string;
  lead: string;
  includes: string[];
  note: { heading: string; body: string };
};

export const services: Record<string, Service> = {
  'wedding-photography': {
    mark: 'Photography',
    title: 'Wedding photography, run as a production.',
    lead: 'Multi-day coverage with a named crew, a shot plan per function and a delivery schedule the couple can hold you to.',
    includes: [
      'Crew assigned per function, not per day',
      'Shot plan agreed before the first event',
      'Venue and timing held against each shoot',
      'Culled selects delivered to an agreed date',
      'Final album and print files on handover',
    ],
    note: {
      heading: 'Every frame belongs to a project record.',
      body: 'Coverage, crew, balance and delivery status live on one wedding record in the CRM, so nobody has to ask three people where a shoot stands.',
    },
  },
  'wedding-films': {
    mark: 'Films',
    title: 'Wedding films, cut to a schedule you can trust.',
    lead: 'Cinematography and edit handled as its own production track, with its own crew, its own milestones and its own delivery date.',
    includes: [
      'Cinematographers assigned alongside the stills crew',
      'Audio and multi-camera coverage per function',
      'Teaser cut to an agreed early date',
      'Feature film with revision rounds defined up front',
      'Masters and social cuts on delivery',
    ],
    note: {
      heading: 'Film and stills stop drifting apart.',
      body: 'Both tracks hang off the same wedding record, so a delayed edit is visible next to the balance due rather than discovered a month later.',
    },
  },
  'pre-wedding': {
    mark: 'Pre-wedding',
    title: 'Pre-wedding shoots, scheduled without the back-and-forth.',
    lead: 'A single shoot with a location, a crew and a turnaround — booked against the same client record as the wedding itself.',
    includes: [
      'Location and permit notes held on the shoot',
      'Crew and equipment assigned in advance',
      'Wardrobe and timing confirmed with the couple',
      'Edited set delivered on an agreed date',
      'Selects carried through to the wedding album',
    ],
    note: {
      heading: 'The first shoot sets the tone for the balance.',
      body: 'Pre-wedding work is where most studios first slip on delivery. Tracking it as a real shoot — with a date and an owner — is the point.',
    },
  },
  'album-design': {
    mark: 'Albums',
    title: 'Album design, tracked to the last spread.',
    lead: 'Design, revisions and print handled as a delivery milestone rather than an afterthought once the season ends.',
    includes: [
      'Spread count and layout agreed before design',
      'Revision rounds defined and counted',
      'Client selects captured against the project',
      'Print and binding specification recorded',
      'Handover logged as a delivery event',
    ],
    note: {
      heading: 'The album is the last thing anyone remembers.',
      body: 'It is also the step most likely to sit at ninety percent for a month. Holding it as a tracked milestone is how it closes.',
    },
  },
};
