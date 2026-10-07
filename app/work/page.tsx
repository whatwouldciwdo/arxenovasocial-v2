import React from 'react';
import { createHash } from 'node:crypto';
import SharedMenuOverlay from '@/components/shared/SharedMenuOverlay';
import SharedAboutModal from '@/components/shared/SharedAboutModal';
import { ABOUT_SOURCE_SHA256 } from '@/data/shared-about';
import CanonicalCursor from '@/components/shared/CanonicalCursor';
import { CURSOR_SOURCE_SHA256 } from '@/data/shared-cursor';
import SharedPageTransition from '@/components/shared/SharedPageTransition';
import CtaSection from '@/components/home/CtaSection';
import WorkHeroSection from '@/components/work/WorkHeroSection';
import CanonicalNavbar from '@/components/shared/CanonicalNavbar';
import { NAVBAR_SOURCE_SHA256 } from '@/data/shared-navbar';
import CanonicalFooter from '@/components/shared/CanonicalFooter';
import { FOOTER_SOURCE_SHA256 } from '@/data/shared-footer';
import { WORK_HTML } from '@/data/html-work';
import tree, { WORK_MENU_TREE_SOURCE_SHA256 } from '@/data/work-menu-tree';
import { WORK_HERO_SOURCE_SHA256 } from '@/data/work/hero';
import type { Metadata } from 'next';
import { OG_IMAGE } from '@/data/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portfolio Jasa Website Cilegon & Serang',
  description: 'Lihat portfolio ARXENOVA dalam jasa pembuatan website, design website, SEO, brand strategy, dan visual identity untuk bisnis di Cilegon, Serang, dan sekitarnya.',
  alternates: { canonical: '/work' },
  openGraph: {
    type: 'website',
    url: '/work',
    title: 'Portfolio Jasa Website Cilegon & Serang | ARXENOVA',
    description: 'Portfolio website, SEO, branding, dan pengalaman digital pilihan dari ARXENOVA.',
    images: [OG_IMAGE],
  },
};

function render(node: any, key = 0): React.ReactNode {
  if (typeof node === 'string') return node;
  if (process.env.NAVBAR_USE_LEGACY !== '1' && node.tag === 'header' && node.props?.className === 'navbar_wrap') {
    return <CanonicalNavbar key={key} variant="work" {...node.props} />;
  }
  if (process.env.FOOTER_USE_LEGACY !== '1' && node.tag === 'footer' && node.props?.className === 'footer_wrap_main') {
    return <CanonicalFooter key={key} variant="work" {...node.props} />;
  }
  if (process.env.CURSOR_USE_LEGACY !== '1' && node.props?.className === 'cursor_wrap') {
    return <CanonicalCursor key={key} variant="work" {...node.props} />;
  }
  if (node.sharedMenu) return <SharedMenuOverlay key={key} />;
  if (node.sharedTransition) return process.env.TRANSITION_USE_LEGACY === '1'
    ? <div key={key} className="transition_screen" />
    : <SharedPageTransition key={key} />;
  if (node.sharedAbout && process.env.ABOUT_USE_LEGACY !== '1') {
    return <SharedAboutModal key={key} variant="work" {...node.props} />;
  }
  if (node.workHero && process.env.WORK_HERO_USE_LEGACY !== '1') {
    return <WorkHeroSection key={key} reactFilters={process.env.WORK_HERO_FILTERS_OWNER === 'react'} />;
  }
  if (process.env.WORK_CTA_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('cta_home_wrap')) {
    return <CtaSection key={key} themeSection="dark" />;
  }
  const props = { ...node.props, key };
  if (node.children) return React.createElement(node.tag, props, ...node.children.map(render));
  if (node.rawKind === 'style' && node.tag === 'style') {
    return <style key={key} {...node.props} dangerouslySetInnerHTML={{ __html: node.html }} />;
  }
  const rawRollback = node.props?.className === 'about_wrap' && process.env.ABOUT_USE_LEGACY === '1'
    || node.props?.className === 'navbar_wrap' && process.env.NAVBAR_USE_LEGACY === '1'
    || node.props?.className === 'footer_wrap_main' && process.env.FOOTER_USE_LEGACY === '1'
    || node.props?.className === 'cursor_wrap' && process.env.CURSOR_USE_LEGACY === '1'
    || node.sharedTransition && process.env.TRANSITION_USE_LEGACY === '1'
    || node.workHero && process.env.WORK_HERO_USE_LEGACY === '1'
    || node.props?.className?.split(' ').includes('cta_home_wrap') && process.env.WORK_CTA_USE_LEGACY === '1';
  if (!rawRollback) throw new Error(`Unexpected raw Work shell leaf: ${node.tag}.${node.props?.className || ''}`);
  return React.createElement(node.tag, { ...props, dangerouslySetInnerHTML: { __html: node.html } });
}

export default function WorkPage() {
  if (process.env.MENU_USE_LEGACY === '1') {
    return <div dangerouslySetInnerHTML={{ __html: WORK_HTML }} suppressHydrationWarning />;
  }
  if (createHash('sha256').update(WORK_HTML, 'utf8').digest('hex') !== WORK_MENU_TREE_SOURCE_SHA256) {
    throw new Error('Work menu tree is stale. Run node scripts/generate-work-menu-tree.mjs');
  }
  if (process.env.ABOUT_USE_LEGACY !== '1' && ABOUT_SOURCE_SHA256['/work'] !== WORK_MENU_TREE_SOURCE_SHA256) {
    throw new Error('About data is stale. Run node scripts/generate-about-data.mjs --write');
  }
  if (process.env.NAVBAR_USE_LEGACY !== '1' && NAVBAR_SOURCE_SHA256.work !== WORK_MENU_TREE_SOURCE_SHA256) {
    throw new Error('Navbar data is stale. Run node scripts/generate-navbar-data.mjs');
  }
  if (process.env.FOOTER_USE_LEGACY !== '1' && FOOTER_SOURCE_SHA256['/work'] !== WORK_MENU_TREE_SOURCE_SHA256) {
    throw new Error('Footer data is stale. Run node scripts/generate-footer-data.mjs');
  }
  if (process.env.CURSOR_USE_LEGACY !== '1' && CURSOR_SOURCE_SHA256['/work'] !== WORK_MENU_TREE_SOURCE_SHA256) {
    throw new Error('Cursor data is stale. Run node scripts/generate-cursor-data.mjs');
  }
  if (process.env.WORK_HERO_USE_LEGACY !== '1' && WORK_HERO_SOURCE_SHA256 !== WORK_MENU_TREE_SOURCE_SHA256) {
    throw new Error('Work hero data is stale. Run node scripts/generate-work-hero-data.mjs');
  }
  return render(tree);
}
