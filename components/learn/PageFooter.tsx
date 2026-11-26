import Link from 'next/link';

interface PageFooterProps {
  related?: string[];
  sources?: { title: string; url: string }[];
  slug: string;
}

export function PageFooter({ related, sources, slug }: PageFooterProps) {
  return (
    <div className="mt-12 pt-8 border-t space-y-6">
      {related && related.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Related Notes</h3>
          <div className="flex flex-wrap gap-2">
            {related.map((rel) => (
              <Link
                key={rel}
                href={`/docs/${rel}`}
                className="px-3 py-1.5 rounded-pill bg-secondary text-secondary-foreground text-subheadline hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {rel.split('/').pop()?.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Sources</h3>
          <ul className="space-y-1.5 text-subheadline">
            {sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {src.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
