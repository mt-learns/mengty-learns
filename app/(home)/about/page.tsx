import { LargeTitle } from '@/components/ios/tile';

export default function AboutPage() {
  return (
    <div className="container max-w-screen-xl px-4 py-12">
      <LargeTitle subtitle="Software engineer building reliable systems and learning in public.">About Me</LargeTitle>
      
      <div className="prose dark:prose-invert max-w-none mt-8">
        <p>
          Hi! I'm Lim Mengty. I'm passionate about DevOps, software architecture, cloud infrastructure, and security.
          This site serves as my digital garden and portfolio where I document what I learn.
        </p>

        <h2>Experience & Skills</h2>
        <ul>
          <li><strong>Cloud & Infra:</strong> Docker, Kubernetes, Terraform, AWS, Cloudflare</li>
          <li><strong>Development:</strong> Next.js, TypeScript, React, Tailwind CSS</li>
          <li><strong>Security:</strong> OWASP Top 10, Zero Trust</li>
        </ul>

        <h2>Connect</h2>
        <p>
          Find me on <a href="https://github.com/mengty" target="_blank" rel="noreferrer">GitHub</a> or email me.
        </p>
      </div>
    </div>
  );
}
