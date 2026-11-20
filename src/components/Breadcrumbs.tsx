'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

function formatLabel(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\bIn\b/g, 'in')
    .replace(/\bFor\b/g, 'for')
    .replace(/\bAnd\b/g, 'and');
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    
    // Skip dynamic segments that look like IDs
    if (/^\d+$/.test(segments[i])) continue;

    let label = formatLabel(segments[i]);

    // Special cases
    if (segments[0] === 'leads' && i === 1 && segments.length > 2) {
      label = `${formatLabel(segments[1])} Leads`;
    }
    if (segments[0] === 'leads' && i === 2) {
      label = `${formatLabel(segments[2])} Business Data`;
    }
    if (segments[0] === 'compare' && i === 1) {
      label = `vs ${formatLabel(segments[1])}`;
    }
    if (segments[0] === 'features' && i === 1) {
      label = formatLabel(segments[1]);
    }
    if (segments[0] === 'blog' && i === 1) {
      label = formatLabel(segments[1]);
    }
    if (segments[0] === 'use-cases' && i === 1) {
      label = formatLabel(segments[1]);
    }

    items.push({ label, href: currentPath });
  }

  return items;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  if (breadcrumbItems.length <= 1) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://leadspotter.in${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
        <ol className="flex items-center gap-1.5 flex-wrap">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              )}
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-gray-500 font-medium truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function StaticBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://leadspotter.in${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex items-center gap-1.5 flex-wrap">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              )}
              {index === items.length - 1 ? (
                <span className="text-gray-500 font-medium truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
