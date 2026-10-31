// Client profiles, shared by the Who We Serve page and the home page.
// `icon` is the inner SVG markup for a 24x24 stroke icon.

export const SEGMENTS = [
  {
    icon: <path d="M3 21V9l9-6 9 6v12M9 21v-6h6v6" />,
    eyebrow: 'Wealth tied to a business',
    title: 'Business Owners',
    body: 'Most of your wealth sits in your business. We help you build wealth outside it too, and plan for who takes over.',
  },
  {
    icon: <><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></>,
    eyebrow: 'Big payouts, uneven income',
    title: 'Entrepreneurs & Founders',
    body: 'Funding rounds, ESOPs and income that comes in bursts. We plan for money that doesn\'t arrive like a salary.',
  },
  {
    icon: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="17" cy="8.5" r="2.6" /><path d="M15 14.2c2.7.4 4.7 2.5 4.7 5.8" /></>,
    eyebrow: 'For the whole family',
    title: 'Private Clients & Families',
    body: 'Wealth that passes from one generation to the next, one clear report for everything, and a plan for handing it on.',
  },
  {
    icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    eyebrow: 'Living abroad',
    title: 'NRIs & Global Indians',
    body: 'Money in more than one country, and investments back home. One person looks after all of it.',
  },
  {
    icon: <><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /></>,
    eyebrow: 'Busy careers',
    title: 'Senior Executives & Professionals',
    body: 'Your job leaves little time to manage money. Our written process does that work for you.',
  },
  {
    icon: <><rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" /><rect x="3" y="14" width="7" height="7" rx="1.2" /><rect x="14" y="14" width="7" height="7" rx="1.2" /></>,
    eyebrow: 'Second opinion',
    title: 'Family Offices',
    body: 'A second pair of eyes, and a team to carry out the plan, alongside the people you already work with.',
  },
];
