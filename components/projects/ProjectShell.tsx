import React from 'react';
import tree from '@/data/project-shell-tree';
import CanonicalFooter from '@/components/shared/CanonicalFooter';

type ProjectNode = string | { comment: string } | {
  tag: string;
  props: Record<string, unknown>;
  children: ProjectNode[];
};

function render(node: ProjectNode, key: number, useCanonicalFooter: boolean): React.ReactNode {
  if (typeof node === 'string') return node;
  if ('comment' in node) return null;
  if (useCanonicalFooter && node.tag === 'footer' && node.props?.className === 'footer_wrap') {
    return <CanonicalFooter key={key} variant="project" {...node.props} />;
  }
  if (node.tag === 'style' && node.children.length === 1 && typeof node.children[0] === 'string') {
    return <style key={key} {...node.props} dangerouslySetInnerHTML={{ __html: node.children[0] }} />;
  }
  const props = { ...node.props, key };
  return React.createElement(node.tag, props, ...node.children.map((child, index) => render(child, index, useCanonicalFooter)));
}

// Markup only: monolog-runtime remains the sole footer hover/canvas behavior owner.
export default function ProjectShell({ useCanonicalFooter }: { useCanonicalFooter: boolean }) {
  return render(tree as ProjectNode, 0, useCanonicalFooter);
}
