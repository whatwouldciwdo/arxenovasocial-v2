'use client';

import React, { type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { useAppRouterNavigation } from './AppRouterRuntimeProvider';

export type InternalNavigationLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  navigationHref?: string;
};

export default function InternalNavigationLink({
  href = '',
  navigationHref,
  onClick,
  target,
  children,
  ...props
}: InternalNavigationLinkProps) {
  const navigate = useAppRouterNavigation();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !navigate || event.button !== 0 || event.metaKey || event.ctrlKey
      || event.shiftKey || event.altKey || (target && target !== '_self') || event.currentTarget.hasAttribute('download')) return;
    event.preventDefault();
    void navigate(navigationHref || href).then(handled => {
      if (!handled) window.location.assign(navigationHref || href);
    });
  };
  return <a href={href} target={target} onClick={handleClick} {...props}>{children}</a>;
}
