import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { sectionMeta } from '../lib/utils';

export const GET: APIRoute = async (context) => {
  const sections = ['writeups', 'research', 'series', 'personal'] as const;
  const allPosts: { id: string; data: any; section: string }[] = [];

  for (const section of sections) {
    const posts = await getCollection(section, ({ data }) => !data.draft);
    for (const post of posts) {
      allPosts.push({ ...post, section });
    }
  }

  allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'UnderDunn',
    description: 'Security research, CTF writeups, and more.',
    site: context.site!,
    items: allPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `/${post.section}/${post.id}/`,
      categories: [sectionMeta[post.section]?.label ?? post.section],
    })),
  });
};
