"use client";

// Generated markup from scripts/generate-footer-data.mjs; behavior is maintained separately below.
import React, { forwardRef, type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SHARED_FOOTER, FOOTER_ARTWORK, type FooterVariant } from "@/data/shared-footer";
import { heroWordmarkArtwork, type SvgArtworkNode } from "@/components/home/hero-artwork";
import { createFooterBehavior, FOOTER_BEHAVIOR_ATTRIBUTE, FOOTER_BEHAVIOR_VALUE } from "./footer-behavior";
import InternalNavigationLink from "@/components/app-router/InternalNavigationLink";

function renderArtwork(node: SvgArtworkNode | string, key: number): React.ReactNode {
  if (typeof node === "string") return null;
  return React.createElement(node.tag, { ...node.attributes, key },
    node.children?.map((child, index) => renderArtwork(child, index)));
}

export type CanonicalFooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children" | "dangerouslySetInnerHTML"> & {
  variant: FooterVariant;
  modularBehavior?: boolean;
};

// The generated children remain route-exact; the opt-in client effect owns essentials only.
const CanonicalFooter = forwardRef<HTMLElement, CanonicalFooterProps>(function CanonicalFooter(
  { variant, modularBehavior = process.env.NEXT_PUBLIC_FOOTER_BEHAVIOR === FOOTER_BEHAVIOR_VALUE, ...rootProps },
  forwardedRef,
) {
  const footer = SHARED_FOOTER[variant];
  const pathname = usePathname();
  const localRef = useRef<HTMLElement | null>(null);
  const setRef = (node: HTMLElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  useEffect(() => {
    if (!modularBehavior || !localRef.current) return;
    const controller = createFooterBehavior(localRef.current, pathname);
    return () => controller.destroy();
  }, [modularBehavior, pathname]);
  const behaviorProps = modularBehavior ? { [FOOTER_BEHAVIOR_ATTRIBUTE]: FOOTER_BEHAVIOR_VALUE } : {};
  if (footer.kind === "project") return (
    <footer ref={setRef} className={"footer_wrap"} {...behaviorProps} {...rootProps}>
      <div className={"cta_home_bg-overlay"}>
        <div className={"gap_home_overlay u-grid-custom is-cta"}>
          <div className={"gap_home_line is-cta"} />
          <div id={"w-node-e1ca627e-1dd0-80a9-8e58-5ccb42ec4491-2cab076f"} className={"gap_home_line is-cta"} />
          <div id={"w-node-e1ca627e-1dd0-80a9-8e58-5ccb42ec4492-2cab076f"} className={"gap_home_line is-cta"} />
          <div id={"w-node-e1ca627e-1dd0-80a9-8e58-5ccb42ec4493-2cab076f"} className={"gap_home_line is-cta"} />
        </div>
      </div>
      <div className={"footer_top"}>
        <nav id={"w-node-e1ca627e-1dd0-80a9-8e58-5ccb42ec4495-2cab076f"} className={"footer_nav_wrap"}>
          <div className={"footer_nav_eyebrow"}>
            <div data-wf--global-eyebrow--variant={"small"} className={"g_eyebrow w-variant-2cb9331a-dccf-acfd-7d9b-42f1f2fdffa8"}>
              <div className={"g_eyebrow_circle w-variant-2cb9331a-dccf-acfd-7d9b-42f1f2fdffa8"} />
              <div id={"w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf"} className={"g_eyebrow_text u-text-style-large w-variant-2cb9331a-dccf-acfd-7d9b-42f1f2fdffa8"}>
                {"Navigation"}
              </div>
            </div>
          </div>
          <ul className={"footer_nav_ul u-gap-small u-hflex-left-center"}>
            <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
              <a href={"#"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                  {"Home"}
                </div>
                <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                  {"\u2192"}
                </div>
              </a>
            </li>
            <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
              <a href={"#"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                  {"Work"}
                </div>
                <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                  {"\u2192"}
                </div>
              </a>
            </li>
            <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
              <a href={"#"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                  {"About"}
                </div>
                <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                  {"\u2192"}
                </div>
              </a>
            </li>
            <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
              <a href={"#"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                  {"Community"}
                </div>
                <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                  {"\u2192"}
                </div>
              </a>
            </li>
            <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
              <a href={"#"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                  {"Contact"}
                </div>
                <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                  {"\u2192"}
                </div>
              </a>
            </li>
          </ul>
        </nav>
        <div id={"w-node-e1ca627e-1dd0-80a9-8e58-5ccb42ec44a3-2cab076f"} className={"footer_middle_wrap"}>
          <div className={"footer_middle_email u-text-style-h4 is-address"}>
            <span>
              {"A:"}
            </span>
            {" Jakarta, Indonesia"}
          </div>
          <a href={"mailto:hello@bymonolog.com"} className={"footer_middle_email w-inline-block"}>
            <div className={"footer_middle_email u-text-style-h4"}>
              {"\u2ba1 huy@bymonolog.com"}
            </div>
          </a>
          <a href={"https://webflow.com/@byhuy"} target={"_blank"} className={"footer_middle_webflow w-inline-block"}>
            <svg xmlns={"http://www.w3.org/2000/svg"} width={"100%"} viewBox={"0 0 156 28"} fill={"none"} className={"svg-6"}>
              <path d={FOOTER_ARTWORK[0]} fill={"currentColor"} className={"path-2"} />
              <path fillRule={"evenodd"} clipRule={"evenodd"} d={FOOTER_ARTWORK[1]} fill={"currentColor"} className={"path-3"} />
              <path d={FOOTER_ARTWORK[2]} fill={"currentColor"} className={"path-4"} />
            </svg>
          </a>
        </div>
        <nav id={""} className={"footer_socials_wrap"}>
          <ul className={"footer_socials_ul"}>
            <li data-hover-highlight={"link"} className={"footer_socials_li"}>
              <a href={"#"} className={"footer_socials_link w-inline-block"}>
                <div data-hover-heading={""} className={"footer_socials_text u-text-style-h4"}>
                  {"youtube"}
                </div>
              </a>
            </li>
            <li data-hover-highlight={"link"} className={"footer_socials_li"}>
              <a href={"#"} className={"footer_socials_link w-inline-block"}>
                <div data-hover-heading={""} className={"footer_socials_text u-text-style-h4"}>
                  {"Linkedin"}
                </div>
              </a>
            </li>
            <li data-hover-highlight={"link"} className={"footer_socials_li"}>
              <a href={"#"} className={"footer_socials_link w-inline-block"}>
                <div data-hover-heading={""} className={"footer_socials_text u-text-style-h4"}>
                  {"Instagram"}
                </div>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className={"footer_bottom"}>
        <div className={"footer_bottom_deco"}>
          <canvas className={"footer_bottom_canvas"} />
          <img src={"https://cdn.prod.website-files.com/68b652bbd6c64a44c8fe3e5e/692704b3b1b1ed0a3f6dcf56_new.avif"} loading={"lazy"} alt={""} className={"footer_bottom_img"} />
        </div>
        <div className={"hero_home_bottom"}>
          <svg xmlns={"http://www.w3.org/2000/svg"} width={"100%"} viewBox={"0 0 544 83"} fill={"none"} className={"hero_home_svg"}>
            {heroWordmarkArtwork.map(renderArtwork)}
          </svg>
        </div>
        <div className={"hero_home_extras u-text-style-xsmall"}>
          <div className={"footer_middle_rights u-text-mono"}>
            {"\u00a92025 All rights reserved \u2022 ARXENOVA LLC "}
          </div>
          <div className={"footer_middle_rights u-text-mono"}>
            {"people first design studio \u2022"}
          </div>
          <div className={"footer_middle_rights u-text-mono"}>
            {"Made with care"}
          </div>
          <a href={"#"} className={"footer_middle_rights u-text-mono"}>
            {"Privacy policy"}
          </a>
          <div className={"footer_middle_rights u-text-mono"}>
            {"\u2022"}
          </div>
          <a href={"#"} className={"footer_middle_rights u-text-mono"}>
            {"Terms of use"}
          </a>
        </div>
      </div>
    </footer>
  );
  return (
    <footer ref={setRef} data-footer-parallax={""} className={"footer_wrap_main"} {...behaviorProps} {...rootProps}>
      <div data-footer-parallax-inner={""} className={"footer_wrap"}>
        <div className={"footer_top"}>
          <div className={"footer_eyebrow"}>
            <div data-wf--global-eyebrow--variant={"base"} className={"g_eyebrow"}>
              <div className={"g_eyebrow_circle"} />
              <div id={"w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf"} className={"g_eyebrow_text u-text-style-large"}>
                {"Navigation"}
              </div>
            </div>
            <nav className={"footer_nav_wrap"}>
              <ul className={"footer_nav_ul u-gap-small u-hflex-left-center"}>
                <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
                  <button id={""} data-open-modal={""} data-hover-highlight={"link"} className={"footer_nav_text"}>
                    <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                      {"About"}
                    </div>
                    <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                      {"\u2192"}
                    </div>
                  </button>
                </li>
                <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
                  <InternalNavigationLink href={"/work"} data-hover-highlight={"link"} className={footer.workClassName} aria-current={footer.workAriaCurrent ?? undefined}>
                    <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                      {"Work"}
                    </div>
                    <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                      {"\u2192"}
                    </div>
                  </InternalNavigationLink>
                </li>
                <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
                  <InternalNavigationLink href={"#process"} navigationHref={"/#process"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                    <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                      {"Process"}
                    </div>
                    <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                      {"\u2192"}
                    </div>
                  </InternalNavigationLink>
                </li>
                <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
                  <InternalNavigationLink href={"#services"} navigationHref={"/#services"} data-hover-highlight={"link"} className={"footer_nav_text w-inline-block"}>
                    <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                      {"Services"}
                    </div>
                    <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                      {"\u2192"}
                    </div>
                  </InternalNavigationLink>
                </li>
                <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
                  <a href={"https://byhuy.gumroad.com/"} data-hover-highlight={"link"} target={"_blank"} className={"footer_nav_text w-inline-block"}>
                    <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                      {"Resources"}
                    </div>
                    <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                      {"\u2192"}
                    </div>
                  </a>
                </li>
                <li data-wf--footer-link--variant={"base"} className={"footer_nav_li"}>
                  <a href={"https://cal.com/byhuy/project-intro-call"} data-hover-highlight={"link"} target={"_blank"} className={"footer_nav_text w-inline-block"}>
                    <div data-hover-heading={""} className={"footer_nav_span u-text-style-h3"}>
                      {"Contact"}
                    </div>
                    <div data-footer-arrow={""} className={"footer_nav_span u-text-style-h3 is-arrow"}>
                      {"\u2192"}
                    </div>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className={"footer_aside_contain"}>
            <div className={"footer_aside_details"}>
              <div className={"footer_top_text u-text-mono"}>
                {"(STUDIO DETAILS)"}
              </div>
              <div className={"footer_middle_wrap"}>
                <a href={"https://webflow.com/@byhuy"} target={"_blank"} className={"footer_middle_webflow w-inline-block"}>
                  <div className={"footer_middle_text u-sr-only"}>
                    {"Webflow certified partner page"}
                  </div>
                  <svg xmlns={"http://www.w3.org/2000/svg"} width={"100%"} viewBox={"0 0 156 28"} fill={"none"} className={"svg-6"}>
                    <path d={FOOTER_ARTWORK[0]} fill={"currentColor"} className={"path-2"} />
                    <path fillRule={"evenodd"} clipRule={"evenodd"} d={FOOTER_ARTWORK[1]} fill={"currentColor"} className={"path-3"} />
                    <path d={FOOTER_ARTWORK[2]} fill={"currentColor"} className={"path-4"} />
                  </svg>
                </a>
                <a data-hover-highlight={"link"} href={"mailto:hello@bymonolog.com?subject=Coming%20from%20your%20website%3A%20%5BSubject%5D"} className={"footer_middle_email w-inline-block"}>
                  <div data-hover-heading={""} className={"footer_middle_email u-text-style-h6"}>
                    {footer.emailText}
                  </div>
                </a>
                <div className={"footer_middle_address u-text-style-h6"}>
                  {"Based in Jakarta & Cilegon, Indonesia"}
                  <br />
                  {"Working Worldwide. "}
                </div>
              </div>
            </div>
            <div className={"footer_aside_details"}>
              <div className={"footer_top_text u-text-mono"}>
                {"(socials)"}
              </div>
              <nav id={""} className={"footer_socials_wrap"}>
                <ul className={"footer_socials_ul"}>
                  <li data-hover-highlight={"link"} className={"footer_socials_li"}>
                    <a href={""} target={"_blank"} className={"footer_socials_link w-inline-block"}>
                      <div data-hover-heading={""} className={"footer_socials_text u-text-style-h4"}>
                        {"YouTube \u2197"}
                      </div>
                    </a>
                  </li>
                  <li data-hover-highlight={"link"} className={"footer_socials_li"}>
                    <a href={""} target={"_blank"} className={"footer_socials_link w-inline-block"}>
                      <div data-hover-heading={""} className={"footer_socials_text u-text-style-h4"}>
                        {"Linkedin \u2197"}
                      </div>
                    </a>
                  </li>
                  <li data-hover-highlight={"link"} className={"footer_socials_li"}>
                    <a href={""} target={"_blank"} className={"footer_socials_link w-inline-block"}>
                      <div data-hover-heading={""} className={"footer_socials_text u-text-style-h4"}>
                        {"Instagram \u2197"}
                      </div>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div className={"footer_bottom"}>
          <div className={"hero_home_bottom u-grid-custom"}>
            <div id={"w-node-f46a50b7-e40c-61b4-7e52-ac077f4ea6ad-7f4ea66b"} className={"footer_bottom_time"}>
              <canvas id={"seasonal-canvas"} className={"footer_bottom_canvas"} />
              <div className={"footer_bottom_date"}>
                <span className={"footer_bottom_location"}>
                  <span className={"footer_bottom_span u-text-style-main u-text-trim-off is-city"}>
                    {"Jakarta"}
                  </span>
                  <span data-footer-time={""} className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                    {"##"}
                  </span>
                </span>
                <span className={"footer_bottom_location"}>
                  <span data-footer-date={""} className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                    {"DD, MM DD, YY (GMT +07)"}
                  </span>
                </span>
              </div>
            </div>
            <div id={"w-node-f46a50b7-e40c-61b4-7e52-ac077f4ea6b8-7f4ea66b"} className={"footer_bottom_availability"}>
              <button id={"to-top"} data-hover-highlight={"link"} className={"footer_bottom_span is-top"}>
                <span data-hover-heading={""} className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                  {"Back to top\u00a0\u00a0"}
                </span>
                <span data-top-arrow={""} data-hover-heading={""} className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                  {"\u2191"}
                </span>
              </button>
              <span className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                {"Booking projects for Q3 \u20182026"}
              </span>
            </div>
            <div id={"w-node-f46a50b7-e40c-61b4-7e52-ac077f4ea6c0-7f4ea66b"} className={"footer_bottom_brand"}>
              <span className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                {"\u00a9 "}
              </span>
              <span data-footer-year={""} className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                {"####"}
              </span>
              <span className={"footer_bottom_span u-text-style-main u-text-trim-off"}>
                {"\u00a0ARXENOVA Studio"}
              </span>
            </div>
          </div>
        </div>
        <div className={"code-embed-4 w-embed"}>
          <style>
            {footer.embeddedCss}
          </style>
        </div>
      </div>
      <div data-footer-parallax-dark={""} className={"footer-wrap-dark"} />
      <div data-cursor-text={"Hold to disrupt"} data-canvas-container={""} data-cursor-hover={""} className={"footer_canvas_bottom"}>
        <canvas data-canvas={""} className={"footer_canvas_item"} />
        <div className={"footer_canvas_content"}>
          <svg xmlns={"http://www.w3.org/2000/svg"} width={"100%"} viewBox={"0 0 544 83"} fill={"none"} data-canvas-content={"left"} className={"footer_canvas_svg"}>
            {heroWordmarkArtwork.map(renderArtwork)}
          </svg>
          <span data-canvas-content={"right"} className={"footer_canvas_text u-text-style-main"}>
            {"\u300eRefuse to be underestimated. \u300f"}
          </span>
        </div>
      </div>
    </footer>
  );
});

export default CanonicalFooter;
