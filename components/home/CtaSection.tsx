import React from 'react';
import { homeCta } from '../../data/home/cta';
import { ctaAwardsHtml } from './cta-artwork';

const arrowPath = 'M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z';
const variant = 'w-variant-c2ee8580-9f06-5e9a-1461-dda4efd8c449';

function ButtonArrow({ absolute = false }: { readonly absolute?: boolean }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" className={`g_btn_svg ${variant}${absolute ? ' is-absolute' : ''}`}><path d={arrowPath} fill="currentColor" /></svg>;
}

// Markup only: the legacy runtime owns scroll translation and CTA animation.
export default function CtaSection() {
  return (
    <section className="cta_home_wrap">
      <div className="cta_home_contain">
        <div className="cta_home_inner">
          <div className="cta_home_header">
            <h2 className="cta_home_heading u-text-style-display u-sr-only">{homeCta.accessibleHeading}</h2>
            <div className="cta_home_heading_contain">
              <div className="cta_home_heading u-text-style-display">{homeCta.headingLines[0]}</div>
              <div className="cta_home_heading u-text-style-display is-2">{homeCta.headingLines[1]}</div>
              <div className="cta_home_heading u-text-style-display is-3">{homeCta.headingLines[2]}</div>
              <span className="cta_heading_inner">
                <div className="cta_home_heading u-text-style-display is-4 is-arrow">→</div>
                <div className="cta_home_heading u-text-style-display is-4">{homeCta.headingLines[3]}</div>
              </span>
            </div>
            <a data-btn-default="" data-wf--global-button-main--variant="large" href={homeCta.buttonHref} target="_blank" className={`g_btn_main ${variant} w-inline-block`}>
              <div className={`g_btn_text_contain ${variant}`}><div className={`g_btn_text u-text-style-small u-text-trim-off ${variant}`}>{homeCta.buttonLabel}</div></div>
              <div className={`g_btn_aside_wrap ${variant}`}>
                <div className={`g_btn_aside_bg ${variant}`} />
                <ButtonArrow />
                <ButtonArrow absolute />
              </div>
            </a>
          </div>
        </div>
        <div className="cta_home_bottom">
          <div data-wf--spacer--section-space="main" className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490" />
          <div className="cta_home_proof">
            <div className="cta_home_awards" dangerouslySetInnerHTML={{ __html: ctaAwardsHtml }} />
            <blockquote className="cta_home_testimonial_message u-text-style-h5">{homeCta.testimonial}</blockquote>
            <div className="cta_home_testimonee u-text-mono">{homeCta.testimonee}</div>
          </div>
        </div>
      </div>
      <div data-start="top bottom" data-scroll-container="" data-target-translate="150" className="cta_home_cover">
        <div className="cta_home_overlay" />
        <img data-translate-hero="true" loading="lazy" alt={homeCta.image.alt} src={homeCta.image.src} className="cta_home_visual" />
      </div>
    </section>
  );
}
