import React from 'react';
import { clientLogos, problemStats } from '../../data/home/problems';

const previousPath = 'M6.696 13L0 6.5L6.696 0L8.04 1.32796L3.672 5.5448H13V7.4552H3.672L8.04 11.6953L6.696 13Z';
const nextPath = 'M6.304 -5.85383e-07L13 6.5L6.304 13L4.96 11.672L9.328 7.4552L4.84742e-07 7.4552L6.51754e-07 5.5448L9.328 5.5448L4.96 1.30466L6.304 -5.85383e-07Z';

// Markup only: legacy owns slider, SplitText, stacking, highlight, and cleanup.
export default function ProblemsSection() {
  return (
    <section data-theme-section="dark" data-stacking-cards-item="" data-slider="" className="problems_home_wrap">
      <header className="problems_home_header">
        <div className="problems_home_stats">
          <div className="problems_stats_navigation">
            <div className="problem_stats_line">
              <div data-progress-bar-start="" className="problem_stats_progress-start" />
              <div data-progress-bar-end="" className="problem_stats_progress-end" />
            </div>
            <div className="problem_stats_bottom">
              <div className="problem_stats_pagination">
                <button aria-label="previous statistic" data-slider-prev="" data-btn-default="" className="problem_stats_button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 13 13" fill="none" className="problem_stats_svg"><path d={previousPath} fill="currentColor" /></svg>
                </button>
                <button aria-label="next statistic" data-slider-next="" data-btn-default="" className="problem_stats_button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 13 13" fill="none" className="problem_stats_svg"><path d={nextPath} fill="currentColor" className="path-5" /></svg>
                </button>
              </div>
              <div className="problem_stats_index">
                <div className="problem_stats_index_text u-text-mono u-text-style-xsmall">0<span data-dynamic-value="" className="testimonials_dynamic_value">#</span></div>
                <div className="problem_stats_index_text u-text-mono u-text-style-xsmall">/</div>
                <div className="problem_stats_index_text u-text-mono u-text-style-xsmall">0<span data-counter-value="" className="testimonials_counter_value">3</span></div>
              </div>
            </div>
          </div>
          <div className="problem_home_stat-collection w-dyn-list">
            <div role="list" className="problem_home_stat-list w-dyn-items">
              {problemStats.map(stat => (
                <div key={stat.value} data-slider-item="" role="listitem" className="problem_home_stat-item w-dyn-item">
                  <div data-slider-headshot="" data-split-text="" className="problem_home_stat-num u-text-style-h3">{stat.value}</div>
                  <p data-slider-message="" data-split-text="" className="problem_home_stat-p u-text-style-main">{stat.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="problems_home_top">
          <h2 data-highlight-text="" className="problems_home_heading u-text-style-h1 u-weight-bold">Visionary founders building game-changing things deserve a digital presence that actually does justice to what they&apos;ve created. Most founders we team up with have built something remarkable—yet their website barely tells the real story. <br /><br />That gap costs way more than just revenue. It costs the confidence that your brand is finally being seen, understood, and taken seriously.</h2>
          <div className="gap_home_testimonial">
            <img src="/images/teams/fadel-febrian.jpeg" loading="lazy" alt="A headshot of Fadel Febrian Alexander" className="problems_home_headshot" />
            <div className="gap_home_content">
              <div className="gap_home_content_text u-text-style-main">Fadel Febrian Alexander</div>
              <div className="gap_home_content_text u-text-style-main">Founder, ARXENOVA</div>
            </div>
          </div>
        </div>
      </header>
      <div className="problems_home_header-inner" />
      <div className="problems_home_bottom">
        <div className="problems_home_left">
          <div data-wf--global-eyebrow--variant="base" className="g_eyebrow">
            <div className="g_eyebrow_circle" />
            <div id="w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf" className="g_eyebrow_text u-text-style-large">Brands we&apos;ve helped </div>
          </div>
        </div>
        <div className="problems_home_collection w-dyn-list">
          <div role="list" className="problems_home_list u-grid-custom w-dyn-items">
            {clientLogos.map(client => (
              <div key={client.label} role="listitem" className="problems_home_item w-dyn-item">
                <img src={client.src} loading="lazy" width="351" height="351" alt={client.alt} className="problems_home_image" style={client.style} />
                <div className="problems_home_label u-text-mono">{client.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
