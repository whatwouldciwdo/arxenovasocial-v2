import React from 'react';
import { createHash } from 'node:crypto';
import { getHomeHtml } from '@/data/html-home';
import ProjectProcess from '@/components/home/ProjectProcess';
import FaqSection from '@/components/home/FaqSection';
import ProblemsSection from '@/components/home/ProblemsSection';
import CtaSection from '@/components/home/CtaSection';
import HeroSection from '@/components/home/HeroSection';
import SharedMenuOverlay from '@/components/shared/SharedMenuOverlay';
import SharedAboutModal from '@/components/shared/SharedAboutModal';
import { ABOUT_SOURCE_SHA256 } from '@/data/shared-about';
import CanonicalCursor from '@/components/shared/CanonicalCursor';
import { CURSOR_SOURCE_SHA256 } from '@/data/shared-cursor';
import SharedPageTransition from '@/components/shared/SharedPageTransition';
import CanonicalNavbar from '@/components/shared/CanonicalNavbar';
import { NAVBAR_SOURCE_SHA256 } from '@/data/shared-navbar';
import CanonicalFooter from '@/components/shared/CanonicalFooter';
import { FOOTER_SOURCE_SHA256 } from '@/data/shared-footer';
import tree, { HOME_TREE_SOURCE_SHA256 } from '@/data/process-integration-tree';

export const dynamic = 'force-dynamic';

function render(node: any, key = 0, modularFaq = false, reactFaq = false): React.ReactNode {
  if (typeof node === 'string') return node;
  if (process.env.NAVBAR_USE_LEGACY !== '1' && node.tag === 'header' && node.props?.className === 'navbar_wrap') {
    return <CanonicalNavbar key={key} variant="home" {...node.props} />;
  }
  if (process.env.FOOTER_USE_LEGACY !== '1' && node.tag === 'footer' && node.props?.className === 'footer_wrap_main') {
    return <CanonicalFooter key={key} variant="home" {...node.props} />;
  }
  if (process.env.CURSOR_USE_LEGACY !== '1' && node.props?.className === 'cursor_wrap') {
    return <CanonicalCursor key={key} variant="home" {...node.props} />;
  }
  if (node.candidate) {
    return <ProjectProcess
      key={key}
      modularVideoPlayback={process.env.PROCESS_VIDEO_USE_MODULAR === '1'}
    />;
  }
  if (process.env.TRANSITION_USE_LEGACY !== '1' && node.props?.className === 'transition_screen') return <SharedPageTransition key={key} />;
  if (process.env.ABOUT_USE_LEGACY !== '1' && node.props?.className === 'about_wrap') {
    return <SharedAboutModal key={key} variant="home" {...node.props} />;
  }
  if (process.env.MENU_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('menu_wrap')) return <SharedMenuOverlay key={key} />;
  if (process.env.HERO_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('hero_home_wrap')) return <HeroSection key={key} />;
  if (process.env.PROBLEMS_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('problems_home_wrap')) return <ProblemsSection key={key} />;
  if (process.env.FAQ_USE_LEGACY !== '1' && node.props?.id === 'faqs') {
    return <FaqSection key={key} modularBehavior={modularFaq} reactOwnership={reactFaq} />;
  }
  if (process.env.CTA_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('cta_home_wrap')) return <CtaSection key={key} />;
  const props = { ...node.props, key };
  if (node.children) {
    return React.createElement(node.tag, props, ...node.children.map((child: any, index: number) => render(child, index, modularFaq, reactFaq)));
  }
  if (node.rawKind === 'style' && node.tag === 'style') {
    return <style key={key} {...node.props} dangerouslySetInnerHTML={{ __html: node.html }} />;
  }
  const rawRollback = node.props?.className === 'about_wrap' && process.env.ABOUT_USE_LEGACY === '1'
    || node.props?.className === 'navbar_wrap' && process.env.NAVBAR_USE_LEGACY === '1'
    || node.props?.className === 'footer_wrap_main' && process.env.FOOTER_USE_LEGACY === '1'
    || node.props?.className === 'cursor_wrap' && process.env.CURSOR_USE_LEGACY === '1'
    || node.props?.className === 'transition_screen' && process.env.TRANSITION_USE_LEGACY === '1'
    || node.props?.className?.split(' ').includes('menu_wrap') && process.env.MENU_USE_LEGACY === '1'
    || node.props?.className?.split(' ').includes('hero_home_wrap') && process.env.HERO_USE_LEGACY === '1'
    || node.props?.className?.split(' ').includes('problems_home_wrap') && process.env.PROBLEMS_USE_LEGACY === '1'
    || node.props?.id === 'faqs' && process.env.FAQ_USE_LEGACY === '1'
    || node.props?.className?.split(' ').includes('cta_home_wrap') && process.env.CTA_USE_LEGACY === '1';
  if (!rawRollback) throw new Error(`Unexpected raw Home shell leaf: ${node.tag}.${node.props?.className || ''}`);
  return React.createElement(node.tag, { ...props, dangerouslySetInnerHTML: { __html: node.html } });
}

export default function HomePage() {
  const html = getHomeHtml();
  if (process.env.PROCESS_USE_LEGACY === '1') {
    return <div dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />;
  }
  if (createHash('sha256').update(html, 'utf8').digest('hex') !== HOME_TREE_SOURCE_SHA256) {
    throw new Error('Home tree is stale. Run node scripts/generate-home-tree.mjs');
  }
  if (process.env.ABOUT_USE_LEGACY !== '1' && ABOUT_SOURCE_SHA256['/'] !== HOME_TREE_SOURCE_SHA256) {
    throw new Error('About data is stale. Run node scripts/generate-about-data.mjs --write');
  }
  if (process.env.NAVBAR_USE_LEGACY !== '1' && NAVBAR_SOURCE_SHA256.home !== HOME_TREE_SOURCE_SHA256) {
    throw new Error('Navbar data is stale. Run node scripts/generate-navbar-data.mjs');
  }
  if (process.env.FOOTER_USE_LEGACY !== '1' && FOOTER_SOURCE_SHA256['/'] !== HOME_TREE_SOURCE_SHA256) {
    throw new Error('Footer data is stale. Run node scripts/generate-footer-data.mjs');
  }
  if (process.env.CURSOR_USE_LEGACY !== '1' && CURSOR_SOURCE_SHA256['/'] !== HOME_TREE_SOURCE_SHA256) {
    throw new Error('Cursor data is stale. Run node scripts/generate-cursor-data.mjs');
  }
  const reactFaq = process.env.FAQ_BEHAVIOR_OWNER === 'react';
  const modularFaq = process.env.FAQ_USE_LEGACY !== '1' && !reactFaq;
  return render(tree, 0, modularFaq, reactFaq);
}
