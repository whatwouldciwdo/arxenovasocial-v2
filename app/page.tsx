import React from 'react';
import { createHash } from 'node:crypto';
import { getHomeHtml } from '@/data/html-home';
import ProjectProcess from '@/components/home/ProjectProcess';
import FaqSection from '@/components/home/FaqSection';
import ProblemsSection from '@/components/home/ProblemsSection';
import CtaSection from '@/components/home/CtaSection';
import tree, { HOME_TREE_SOURCE_SHA256 } from '@/data/process-integration-tree';

export const dynamic = 'force-dynamic';

function render(node: any, key = 0): React.ReactNode {
  if (typeof node === 'string') return node;
  if (node.candidate) return <ProjectProcess key={key} />;
  if (process.env.PROBLEMS_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('problems_home_wrap')) return <ProblemsSection key={key} />;
  if (process.env.FAQ_USE_LEGACY !== '1' && node.props?.id === 'faqs') return <FaqSection key={key} />;
  if (process.env.CTA_USE_LEGACY !== '1' && node.props?.className?.split(' ').includes('cta_home_wrap')) return <CtaSection key={key} />;
  const props = { ...node.props, key };
  return node.children
    ? React.createElement(node.tag, props, ...node.children.map(render))
    : React.createElement(node.tag, { ...props, dangerouslySetInnerHTML: { __html: node.html } });
}

export default function HomePage() {
  const html = getHomeHtml();
  if (process.env.PROCESS_USE_LEGACY === '1') {
    return <div dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />;
  }
  if (createHash('sha256').update(html, 'utf8').digest('hex') !== HOME_TREE_SOURCE_SHA256) {
    throw new Error('Home tree is stale. Run node scripts/generate-home-tree.mjs');
  }
  return render(tree);
}
