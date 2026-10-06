import React from 'react';
import { homeHero } from '../../data/home/hero';
import { heroContentArtwork, heroWordmarkArtwork, type SvgArtworkNode } from './hero-artwork';

function renderArtwork(node: SvgArtworkNode | string, key: number): React.ReactNode {
  if (typeof node === 'string') return node;
  return React.createElement(node.tag, { ...node.attributes, key },
    node.children?.map((child, index) => renderArtwork(child, index)));
}

// Markup only: the legacy runtime owns SplitText, intro animation, canvas, and parallax.
export default function HeroSection() {
  return (
    <section data-animate="" data-theme-section="dark" data-scroll-container="" data-target-translate="100" data-overlay-container="" className="hero_home_wrap">
      <div className="hero_home_gradient" />
      <div data-hero-canvas-container="" className="hero_home_cover">
        <div className="hero_home_fade" />
        <div data-overlay-scroll="" className="hero_home_overlay" />
        <img src={homeHero.image.src} loading="eager" width={homeHero.image.width} height={homeHero.image.height} alt={homeHero.image.alt} fetchPriority="high" data-translate-hero="true" className="hero_home_img" />
        <canvas data-hero-canvas="" className="hero_canvas_item" />
      </div>
      <div className="hero_home_contain">
        <div className="hero_home_main">
          <div className="hero_home_content">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 57 25" fill="none" className="hero_home_content_svg">{heroContentArtwork.map(renderArtwork)}</svg>
            <h1 className="hero_home_content_p u-text-style-h4">{homeHero.headingBeforeBreak}<br />{homeHero.breakSeparator}<br />{homeHero.headingAfterBreak}</h1>
          </div>
          <div className="hero_home_bottom">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 544 83" fill="none" className="hero_home_svg">{heroWordmarkArtwork.map(renderArtwork)}</svg>
          </div>
        </div>
      </div>
    </section>
  );
}
