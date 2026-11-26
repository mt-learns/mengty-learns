import { LargeTitle } from '@/components/ios/tile';
import { projects } from '@/content/projects';
import { ProjectsFilter } from './projects-filter';

export default function ProjectsPage() {
  const topics = ['All', ...Array.from(new Set(projects.flatMap((p) => p.tags)))];

  return (
    <div className="container max-w-screen-xl px-4 py-12">
      <LargeTitle subtitle="Open-source tools, design systems, and web apps.">Projects</LargeTitle>
      <ProjectsFilter topics={topics} projects={projects} />
    </div>
  );
}
