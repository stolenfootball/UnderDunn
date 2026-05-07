export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const sectionMeta: Record<string, { label: string; description: string }> = {
  writeups: { label: 'Writeups', description: 'CTF challenge solutions and walkthroughs' },
  research: { label: 'Research', description: 'Security research posts' },
  series: { label: 'Series', description: 'Multi-part series' },
  personal: { label: 'Personal', description: 'Non-technical posts' },
};
