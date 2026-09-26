import React from 'react';
import { faqItems } from '../../data/home/faq';
import { faqArrowPath, faqCss } from './faq-artwork';

// Markup only: the delegated legacy runtime owns accordion and hover behavior.
export default function FaqSection() {
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
        <div data-accordion-close-siblings="true" data-accordion-css-init="" className="g_faq_collection w-dyn-list">
          <div data-index-group="values" id="w-node-_175f460a-5a43-8e1a-5c1c-d7cade701cac-de701ca4" role="list" className="g_faq_list w-dyn-items">
            {faqItems.map((item) => (
              <div key={item.question} data-accordion-status="not-active" role="listitem" className="g_faq_item w-dyn-item">
                <button data-accordion-toggle="" data-hover-highlight="accordion" className="accordion_css_item_top">
                  <span className="accordion_css_item_bg" />
                  <h3 data-hover-heading="" className="accordion_css_item_heading u-text-trim-off u-text-style-large">{item.question}</h3>
                  <div className="accordion_css_square" />
                </button>
                <div className="accordion_css_item_bottom">
                  <div className="accordion_css_bottom_wrap">
                    <div className="accordion_css_bottom_contain">
                      <div className="accordion_css_bottom_rich u-rich-text u-text-style-small w-richtext">
                        {item.answers.map((answer, index) => <p key={index} dangerouslySetInnerHTML={{ __html: answer.html }} />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="faq_css w-embed"><style dangerouslySetInnerHTML={{ __html: faqCss }} /></div>
              </div>
            ))}
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
