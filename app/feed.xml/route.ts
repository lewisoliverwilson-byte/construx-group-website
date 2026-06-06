import { getAllPostMeta } from '@/lib/posts';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://construxgroup.io';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getAllPostMeta();

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/journal/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.tag)}</category>
      <author>lewis.oliver.wilson@googlemail.com (${escapeXml(post.author)})</author>
    </item>`.trim();
    })
    .join('\n    ');

  const lastBuildDate = posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Construx Group — Dispatch</title>
    <link>${BASE_URL}</link>
    <description>Field notes from building AI-first ventures. ${posts.length} dispatches from Construx Group.</description>
    <language>en-gb</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>lewis.oliver.wilson@googlemail.com (Lewis Wilson)</managingEditor>
    <webMaster>lewis.oliver.wilson@googlemail.com (Lewis Wilson)</webMaster>
    <image>
      <url>${BASE_URL}/opengraph-image.png</url>
      <title>Construx Group</title>
      <link>${BASE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
