import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const seriesSchema = postSchema.extend({
  series: z.string(),
  order: z.number(),
});

function postLoader(section: string) {
  return glob({
    base: `./src/content/${section}`,
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/[/\\]index\.md$/, ''),
  });
}

const writeups = defineCollection({
  loader: postLoader('writeups'),
  schema: postSchema,
});

const research = defineCollection({
  loader: postLoader('research'),
  schema: postSchema,
});

const series = defineCollection({
  loader: postLoader('series'),
  schema: seriesSchema,
});

const personal = defineCollection({
  loader: postLoader('personal'),
  schema: postSchema,
});

export const collections = { writeups, research, series, personal };
