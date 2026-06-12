import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { readingTime } from './utils';

const postsDir = path.join(process.cwd(), 'content', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tag: string;
  readingTime: number;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPostMeta(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: filename.replace('.mdx', ''),
        title: data.title ?? 'Untitled',
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        author: data.author ?? 'Construx Group',
        tag: data.tag ?? 'Blog',
        readingTime: readingTime(raw),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? 'Untitled',
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    author: data.author ?? 'Construx Group',
    tag: data.tag ?? 'Journal',
    readingTime: readingTime(raw),
    content,
  };
}
