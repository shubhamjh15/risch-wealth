// Client accounts, grouped by the profiles RISCH works with (the same
// taxonomy as Whom We Serve). `spotlight` marks the few that rotate in the
// home page slider; the Testimonials page shows all of them.
//
// IMPORTANT — PLACEHOLDER COPY. These are representative examples written
// to build the page, not real client statements. Replace each one with a
// genuine, written, consented quote before this goes live, and check it
// against the advertising rules that apply to the firm's registrations.
//
// TEMPORARILY ANONYMOUS, at the client's request (2026-11-01), until real
// testimonials come in: names, portraits, initials and employers are off the
// site. Reverting the commit that added this note brings them all back; the
// portraits are still in assets/clients. An entry can take `name`, `initial`,
// `photo` and `credentials`, and the cards show whichever it has.

export const TESTIMONIAL_GROUPS = [
  'Business Owners',
  'Entrepreneurs & Founders',
  'Senior Executives & CXOs',
  'Doctors & Professionals',
  'Private Clients & Families',
  'NRIs & Global Indians',
  'Family Offices',
  'Other',
];

export const TESTIMONIALS = [
  {
    quote: "RISCH didn't start with a product pitch. They started by asking what I could actually stomach in a bad year, and then built around that answer rather than around a shelf. For someone who has spent a career judging people by their process rather than their promises, that order mattered more than anything else they could have said.",
    place: 'Bengaluru, Karnataka',
    role: 'Director, Software Engineering',
    group: 'Business Owners', spotlight: true, lead: true,
  },
  {
    quote: 'Nearly everything I owned sat inside the business. The plan to build something outside it was written down, with the trade-offs stated, before I agreed to any of it.',
    place: 'Bengaluru, Karnataka',
    role: 'Director of Engineering',
    group: 'Business Owners',
  },
  {
    quote: 'Succession was the conversation I kept postponing. They structured it so the business and the portfolio finally point in the same direction.',
    place: 'Bengaluru, Karnataka',
    role: 'Principal System Engineer',
    group: 'Business Owners',
  },
  {
    quote: "The risk questionnaire took ten minutes and told me more about my own risk tolerance than any conversation I'd had before.",
    place: 'Bengaluru, Karnataka',
    role: 'Director',
    group: 'Entrepreneurs & Founders', spotlight: true,
  },
  {
    quote: 'My income arrives in lumps, not every month. This is the first allocation anyone has built that genuinely accounts for that.',
    place: 'Bengaluru, Karnataka',
    role: 'Director, Cyber Defence',
    group: 'Entrepreneurs & Founders',
  },
  {
    quote: "I don't have the hours to manage this myself. What I have instead is a documented process I can audit in twenty minutes.",
    place: 'Bengaluru, Karnataka',
    role: 'Head, Sourcing & Procurement',
    group: 'Senior Executives & CXOs',
  },
  {
    quote: 'My ESOP concentration was the elephant in the room. It was the first thing they put on the table, not the last.',
    place: 'Bengaluru, Karnataka',
    role: 'Healthcare Operations & Strategy',
    group: 'Senior Executives & CXOs',
  },
  {
    quote: "I had been sold products for years. This was the first conversation that began with my own circumstances rather than someone's shelf.",
    place: 'Kochi, Kerala',
    role: 'Consultant Surgeon',
    group: 'Doctors & Professionals',
  },
  {
    quote: 'Between clinics there is no time to follow markets. The review is short, honest, and tells me only what I actually need to decide.',
    place: 'Bengaluru, Karnataka',
    role: 'Radiologist',
    group: 'Doctors & Professionals',
  },
  {
    quote: 'Consolidated reporting across three custodians, finally in one place. That alone was worth the switch.',
    place: 'Bengaluru, Karnataka',
    role: 'Senior Solution Architect',
    group: 'Private Clients & Families', spotlight: true,
  },
  {
    quote: "I appreciated being shown the worst case before the best case. It's rare, and it's the right order.",
    place: 'Bengaluru, Karnataka',
    role: 'Safety Professional',
    group: 'Private Clients & Families', spotlight: true,
  },
  {
    quote: 'Managing an India allocation from eight thousand kilometres away used to mean chasing four different people. Now it means one call.',
    place: 'Basra, Iraq',
    role: 'Process Engineering Leader',
    group: 'NRIs & Global Indians',
  },
  {
    quote: "Every cross-border question was answered plainly, including the ones where the answer was 'take that to your tax adviser'.",
    place: 'Dallas, Texas, United States',
    role: 'Global Indian',
    group: 'NRIs & Global Indians',
  },
  {
    quote: "We already had advisers. What we didn't have was someone willing to put a view in writing and argue it on our behalf.",
    place: 'Bengaluru, Karnataka',
    role: 'Electrical Engineering & Management Leader',
    group: 'Family Offices',
  },
  {
    quote: 'They work alongside the setup we already had rather than trying to replace it. That is what made the engagement workable.',
    role: 'Senior Leader',
    group: 'Family Offices',
  },
];

// The home page rotates a short, curated set rather than all of them.
export const SPOTLIGHT_TESTIMONIALS = TESTIMONIALS.filter((t) => t.spotlight);
