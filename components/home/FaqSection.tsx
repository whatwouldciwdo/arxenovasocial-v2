'use client';

import React, { useState } from 'react';
import { faqItems, type FaqAnswerNode } from '../../data/home/faq';
import { faqArrowPath } from './faq-artwork';
import { nextFaqIndex } from './faq-state';

function renderAnswer(nodes: readonly FaqAnswerNode[]): React.ReactNode[] {
  return nodes.reduce<React.ReactNode[]>((rendered, node, index) => {
    if (node.type === 'text' || node.type === 'nbsp') {
      const value = node.type === 'text' ? node.value : '\u00a0';
      const previous = rendered.at(-1);
      if (typeof previous === 'string') rendered[rendered.length - 1] = previous + value;
      else rendered.push(value);
    } else if (node.type === 'br') rendered.push(<br key={index} />);
    else rendered.push(<a key={index} href={node.href}>{node.text}</a>);
    return rendered;
  }, []);
}

export default function FaqSection({
  modularBehavior = false,
  reactOwnership = false,
}: {
  modularBehavior?: boolean;
  reactOwnership?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const behavior = reactOwnership || modularBehavior ? 'modular' : undefined;

  return (
    <section id="faqs" className="faq_home_wrap u-grid-custom">
      <div id="w-node-_175f460a-5a43-8e1a-5c1c-d7cade701ca5-de701ca4" className="faq_home_left">
        <div data-wf--global-eyebrow--variant="base" className="g_eyebrow">
          <div className="g_eyebrow_circle" />
          <div id="w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf" className="g_eyebrow_text u-text-style-large">FAQs</div>
        </div>
      </div>
      <div id="w-node-_175f460a-5a43-8e1a-5c1c-d7cade701ca8-de701ca4" className="faq_home_main">
        <h2 className="faq_home_heading u-text-style-h2">Here&apos;s what you need to consider before partnering with us.</h2>
        <div
          data-accordion-close-siblings="true"
          data-accordion-css-init={reactOwnership ? undefined : ''}
          data-faq-behavior={behavior}
          data-faq-owner={reactOwnership ? 'react' : undefined}
          className="g_faq_collection w-dyn-list"
        >
          <div data-index-group="values" id="w-node-_175f460a-5a43-8e1a-5c1c-d7cade701cac-de701ca4" role="list" className="g_faq_list w-dyn-items">
            {faqItems.map((item, itemIndex) => {
              const active = reactOwnership && activeIndex === itemIndex;
              const headingId = `faq-question-${itemIndex + 1}`;
              const regionId = `faq-answer-${itemIndex + 1}`;

              return (
                <div key={item.question} data-accordion-status={active ? 'active' : 'not-active'} role="listitem" className="g_faq_item w-dyn-item">
                  <button
                    type={reactOwnership ? 'button' : undefined}
                    id={reactOwnership ? headingId : undefined}
                    data-accordion-toggle=""
                    data-hover-highlight="accordion"
                    aria-expanded={reactOwnership ? active : undefined}
                    aria-controls={reactOwnership ? regionId : undefined}
                    className="accordion_css_item_top"
                    onClick={reactOwnership ? () => setActiveIndex(current => nextFaqIndex(current, itemIndex)) : undefined}
                  >
                    <span className="accordion_css_item_bg" />
                    <h3 data-hover-heading="" className="accordion_css_item_heading u-text-trim-off u-text-style-large">{item.question}</h3>
                    <div className="accordion_css_square" />
                  </button>
                  <div
                    id={reactOwnership ? regionId : undefined}
                    role={reactOwnership ? 'region' : undefined}
                    aria-labelledby={reactOwnership ? headingId : undefined}
                    className="accordion_css_item_bottom"
                  >
                    <div className="accordion_css_bottom_wrap">
                      <div className="accordion_css_bottom_contain">
                        <div className="accordion_css_bottom_rich u-rich-text u-text-style-small w-richtext">
                          {item.answers.map((answer, index) => <p key={index}>{renderAnswer(answer)}</p>)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {itemIndex === 0 ? <div className="faq_css w-embed"><link rel="stylesheet" href="/css/faq-section.css" /></div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div id="w-node-_175f460a-5a43-8e1a-5c1c-d7cade701cba-de701ca4" className="faq_home_content">
        <img loading="lazy" src="/images/teams/fadel-febrian.jpeg" alt="A headshot of Fadel Febrian Alexander" className="faq_home_headshot" />
        <p className="faq_home_p u-text-style-h5">Got more questions? Chat with Fadel Febrian Alexander.</p>
        <a data-btn-default="" data-wf--global-button-main--variant="base" href="https://cal.com/byhuy/project-intro-call" target="_blank" className="g_btn_main w-inline-block">
          <div className="g_btn_text_contain"><div className="g_btn_text u-text-style-small u-text-trim-off">Book a call with Fadel Febrian Alexander</div></div>
          <div className="g_btn_aside_wrap">
            <div className="g_btn_aside_bg" />
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" className="g_btn_svg"><path d={faqArrowPath} fill="currentColor" /></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" className="g_btn_svg is-absolute"><path d={faqArrowPath} fill="currentColor" /></svg>
          </div>
        </a>
      </div>
    </section>
  );
}
