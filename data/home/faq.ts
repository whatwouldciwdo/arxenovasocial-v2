export type FaqAnswerNode =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'br' }
  | { readonly type: 'link'; readonly href: string; readonly text: string }
  | { readonly type: 'nbsp' };

export interface FaqItem {
  readonly question: string;
  readonly answers: readonly (readonly FaqAnswerNode[])[];
}

const text = (value: string): FaqAnswerNode => ({ type: 'text', value });
const br: FaqAnswerNode = { type: 'br' };

// Preserve source whitespace, line breaks, links, entities, and ordering.
export const faqItems: readonly FaqItem[] = [
  {
    question: 'Who will actually be working on our project?',
    answers: [
      [text('Fadel leads every engagement from strategy, creative direction, and your primary point of contact throughout. ')],
      [text('Depending on scope, a carefully selected team of collaborators supports on design and development. The level of care and craft stays consistent, regardless of project size.')],
    ],
  },
  {
    question: 'How long do your projects usually take?',
    answers: [
      [text('Most projects run 10-14 weeks end-to-end. ')],
      [text('Timelines can flex based on scope, but we set milestones from day one so there are no surprises.')],
    ],
  },
  {
    question: 'How do you communicate and manage work?',
    answers: [
      [text('We keep things simple and transparent with a dedicated Notion portal to manage our project (timelines and deliverables). '), br],
      [text("Most of the time you'll receive async Loom updates and weekly communication via Slack or WhatsApp. We can also integrate with your tools so the process stays structured yet flexible."), br, br, text('Synchronous calls are typically scheduled to review '), br, text('important decisions or milestones of the project.'), br],
    ],
  },
  {
    question: 'What do you need to start working together?',
    answers: [
      [text("We'll discuss your specific needs during a discovery call and we will provide a tailored proposal to match your project needs. ")],
      [text('Afterwards, we just need a signed contract proposal and the initial project deposit payment. That’s all. We make onboarding fast so we can get to work ASAP. Ready to get started? '), { type: 'link', href: 'https://wa.me/6281285313084?text=Hi%20Fadel%2C%20I%27d%20like%20to%20book%20a%20call', text: 'Book a call with Fadel Febrian Alexander' }],
    ],
  },
  {
    question: 'What happens after launch?',
    answers: [
      [text('We provide 90 days of hands-on support to make sure everything runs smoothly and your brand is set to steal the spotlight. You’ll also get tailored documentation and CMS training videos so non-technical team members can update the site with ease. ')],
      [text('After that, you’re fully equipped to manage things in-house, and if you ever want ongoing support, we offer care plans tailored to your needs.')],
    ],
  },
  {
    question: 'Can you handle branding, design and development?',
    answers: [
      [text('Absolutely. Our specialty is delivering all three under one roof and focus on what matters most to you and your business.')],
      [text('Whether you’re a team of 10 or a brand operating in 50 countries, your narrative, identity, visuals, and functionality are aligned from day one, creating a cohesive final experience.')],
    ],
  },
  {
    question: 'What is the project investment?',
    answers: [
      [text('Project investment starts from $20k USD'), { type: 'nbsp' }, text('with most projects ranging from $25k - $50k depending on scope and project complexity.')],
    ],
  },
];
