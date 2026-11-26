'use client';
import { useState } from 'react';

export function Terminal({ children, title = 'Terminal' }: { children: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border bg-card text-card-foreground overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b text-xs text-muted-foreground">
        <span>{title}</span>
        <button onClick={copy} className="hover:text-foreground transition-colors">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto bg-transparent border-0 m-0">
        <code>{children}</code>
      </pre>
    </div>
  );
}
