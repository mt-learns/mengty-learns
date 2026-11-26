import Link from 'next/link';
import { LargeTitle, Tile, GroupedList, SectionIcon } from '@/components/ios/tile';
import { Button } from '@/components/ui/button';
import { source } from '@/lib/source';
import { projects } from '@/content/projects';

export default function HomePage() {
  const pages = source.getPages().sort((a, b) => {
    const da = a.data.updated ? new Date(a.data.updated).getTime() : 0;
    const db = b.data.updated ? new Date(b.data.updated).getTime() : 0;
    return db - da;
  });
  const latest = pages.slice(0, 5);
  const featuredProjects = projects.slice(0, 2);

  return (
    <div className="container max-w-screen-xl px-4 py-12">
      <section className="py-12 md:py-20 flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
          <SectionIcon name="learn" className="h-12 w-12" />
        </div>
        <LargeTitle subtitle="Learning DevOps, architecture and security — one note at a time.">
          Hi, I&apos;m Mengty.
        </LargeTitle>
        <div className="flex gap-4 mt-4">
          <Button asChild className="min-h-tap rounded-control px-6">
            <Link href="/docs">Start learning</Link>
          </Button>
          <Button variant="outline" asChild className="min-h-tap rounded-control px-6">
            <Link href="/projects">View projects</Link>
          </Button>
        </div>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tile
              title="Containers & Docker"
              description="Master containerization, image building, and runtime fundamentals."
              href="/docs/containers/docker-basics"
              badge="Featured"
              icon={<SectionIcon name="containers" />}
              large
            />
          </div>
          <Tile title="Kubernetes" description="Orchestration and cluster management." href="/docs/kubernetes/kubectl-cheatsheet" icon={<SectionIcon name="kubernetes" />} />
          <Tile title="CI/CD Pipelines" description="Automate testing and deployments." href="/docs/ci-cd/github-actions" icon={<SectionIcon name="cicd" />} />
          <Tile title="Security" description="Practical security notes and OWASP basics." href="/docs" icon={<SectionIcon name="security" />} />
        </div>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Latest Notes</h2>
        <GroupedList title="Recently Updated">
          {latest.map((page) => (
            <Link key={page.url} href={page.url} className="flex items-center justify-between gap-4 p-4 min-h-tap hover:bg-muted/50 transition-colors">
              <div>
                <span className="font-medium block">{page.data.title}</span>
                <span className="text-xs text-muted-foreground">{page.data.description}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 capitalize">{page.data.type ?? 'note'}</span>
            </Link>
          ))}
        </GroupedList>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((project) => (
            <Tile
              key={project.title}
              title={project.title}
              description={project.description}
              href={project.url}
              badge={project.tags[0]}
              icon={<SectionIcon name="project" />}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
