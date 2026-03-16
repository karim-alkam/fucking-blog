import Link from 'next/link';

interface BreadcrumbsProps {
  /** The full folder path, e.g. "Self-study/Semiconductors" */
  folderPath?: string;
  /** The current page label (post title or folder name). If omitted the last segment is derived from folderPath. */
  currentLabel?: string;
  /** When true the last segment is the current page (non-linked). Default true. */
  showCurrent?: boolean;
}

export default function Breadcrumbs({ folderPath, currentLabel, showCurrent = true }: BreadcrumbsProps) {
  // Build an array of { label, href } segments
  const crumbs: { label: string; href: string }[] = [
    { label: 'LOG', href: '/posts' },
  ];

  if (folderPath) {
    const segments = folderPath.split('/').filter(Boolean);
    segments.forEach((seg, i) => {
      const href = '/posts/' + segments.slice(0, i + 1).map(encodeURIComponent).join('/');
      crumbs.push({ label: seg.replace(/-/g, ' ').toUpperCase(), href });
    });
  }

  return (
    <nav aria-label="breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 font-mono text-xs tracking-wider">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          // When showCurrent is false (post view) every crumb is a link
          const renderAsLink = !isLast || !showCurrent || !!currentLabel;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span className="text-brass/40 select-none">/</span>}
              {renderAsLink ? (
                <Link
                  href={crumb.href}
                  className="text-celestial-blue/70 hover:text-celestial-blue transition-colors uppercase"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-starlight/80 uppercase">{crumb.label}</span>
              )}
            </li>
          );
        })}
        {currentLabel && (
          <li className="flex items-center gap-1">
            <span className="text-brass/40 select-none">/</span>
            <span className="text-starlight/80 uppercase truncate max-w-[200px]">{currentLabel}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
