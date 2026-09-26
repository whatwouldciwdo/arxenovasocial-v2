export interface FaqAnswer {
  readonly html: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answers: readonly FaqAnswer[];
}

// Preserve source whitespace, line breaks, links, entities, and ordering.
export const faqItems: readonly FaqItem[] = [
  {
    question: 'Who will actually be working on our project?',
    answers: [
      { html: 'Fadel leads every engagement from strategy, creative direction, and your primary point of contact throughout. ' },
      { html: 'Depending on scope, a carefully selected team of collaborators supports on design and development. The level of care and craft stays consistent, regardless of project size.' },
    ],
  },
  {
    question: 'How long do your projects usually take?',
    answers: [
      { html: 'Most projects run 10-14 weeks end-to-end. ' },
      { html: 'Timelines can flex based on scope, but we set milestones from day one so there are no surprises.' },
    ],
  },
  {
    question: 'How do you communicate and manage work?',
    answers: [
      { html: 'We keep things simple and transparent with a dedicated Notion portal to manage our project (timelines and deliverables). <br>' },
      { html: "Most of the time you'll receive async Loom updates and weekly communication via Slack or WhatsApp. We can also integrate with your tools so the process stays structured yet flexible.<br><br>Synchronous calls are typically scheduled to review <br>important decisions or milestones of the project.<br>" },
    ],
  },
  {
    question: 'What do you need to start working together?',
    answers: [
      { html: "We'll discuss your specific needs during a discovery call and we will provide a tailored proposal to match your project needs. " },
      { html: 'Afterwards, we just need a signed contract proposal and the initial project deposit payment. That’s all. We make onboarding fast so we can get to work ASAP. Ready to get started? <a href="https://cal.com/byhuy/project-intro-call?duration=45">Book a call with Fadel Febrian Alexander</a>' },
    ],
  },
  {
    question: 'What happens after launch?',
    answers: [
      { html: 'We provide 90 days of hands-on support to make sure everything runs smoothly and your brand is set to steal the spotlight. You’ll also get tailored documentation and CMS training videos so non-technical team members can update the site with ease. ' },
      { html: 'After that, you’re fully equipped to manage things in-house, and if you ever want ongoing support, we offer care plans tailored to your needs.' },
    ],
  },
  {
    question: 'Can you handle branding, design and development?',
    answers: [
      { html: 'Absolutely. Our specialty is delivering all three under one roof and focus on what matters most to you and your business.' },
      { html: 'Whether you’re a team of 10 or a brand operating in 50 countries, your narrative, identity, visuals, and functionality are aligned from day one, creating a cohesive final experience.' },
    ],
  },
  {
    question: 'What is the project investment?',
    answers: [
      { html: 'Project investment starts from $20k USD&nbsp;with most projects ranging from $25k - $50k depending on scope and project complexity.' },
    ],
  },
];
