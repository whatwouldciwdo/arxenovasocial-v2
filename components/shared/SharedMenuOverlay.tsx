import React from 'react';
import InternalNavigationLink from '@/components/app-router/InternalNavigationLink';

const arrowPath = 'M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z';

const navigation = [
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Services', href: '#services' },
] as const;

const updates = [
  {
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/69e9f4dc7cb660c42ce224bd_Client.svg',
    date: 'September 21, 2026',
  },
  {
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/697db3aecf1ddb096d2ec598_LinkedIn_ProfilePics_2.avif',
    sizes: '(max-width: 1279px) 100vw, 1000px',
    srcSet: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/697db3aecf1ddb096d2ec598_LinkedIn_ProfilePics_2-p-500.avif 500w, https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/697db3aecf1ddb096d2ec598_LinkedIn_ProfilePics_2.avif 1000w',
    date: 'January 20, 2026',
  },
] as const;

function Arrow() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" className="g_btn_svg"><path d={arrowPath} fill="currentColor" /></svg>;
}

function NavigationItem({ children }: { readonly children: React.ReactNode }) {
  return <li data-wf--footer-link--variant="base" className="footer_nav_li">{children}</li>;
}

function LinkContent({ label }: { readonly label: string }) {
  return <><div data-hover-heading="" className="footer_nav_span u-text-style-h3">{label}</div><div data-footer-arrow="" className="footer_nav_span u-text-style-h3 is-arrow">→</div></>;
}

// Markup only. The legacy ke() initializer remains the sole state, animation,
// scroll-lock, keyboard, and lifecycle owner during this migration unit.
export default function SharedMenuOverlay() {
  return (
    <div className="menu_wrap">
      <div className="menu_contain">
        <ul className="menu_contain_nav u-gap-small u-hflex-left-center">
          <NavigationItem><button id="" data-open-modal="" data-hover-highlight="link" className="footer_nav_text"><LinkContent label="About" /></button></NavigationItem>
          {navigation.map(item => <NavigationItem key={item.href}><InternalNavigationLink href={item.href} navigationHref={item.href === '#work' ? '/#work' : `/${item.href}`} data-hover-highlight="link" className="footer_nav_text w-inline-block"><LinkContent label={item.label} /></InternalNavigationLink></NavigationItem>)}
          <NavigationItem><a href="https://wa.me/6281285313084?text=Hi%20Fadel%2C%20I%27d%20like%20to%20get%20in%20touch" data-hover-highlight="link" target="_blank" className="footer_nav_text w-inline-block"><LinkContent label="Contact" /></a></NavigationItem>
        </ul>
      </div>
      <div className="menu_popup_collection w-dyn-list">
        <div role="list" className="menu_popup_list w-dyn-items">
          {updates.map(update => (
            <div role="listitem" className="menu_popup_item w-dyn-item" key={update.date}>
              <a href="#" className="menu_popup_link w-inline-block">
                <div className="menu_popup_cover"><img loading="lazy" src={update.image} alt="" {...('sizes' in update ? { sizes: update.sizes, srcSet: update.srcSet } : {})} className="menu_popup_image" /></div>
                <div className="menu_popup_content"><p className="menu_popup_p u-text-style-small">Supersolid onboards FujiFilm Australia and Hyatt Hotels as clients</p><span className="menu_popup_date u-text-mono">{update.date}</span></div>
              </a>
              <Arrow />
            </div>
          ))}
        </div>
      </div>
      <button data-close-modal="" id="" className="menu_overlay_close" />
    </div>
  );
}
