import type { Metadata } from 'next';
import ArticleReaderClient from './ArticleReaderClient';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://blog-application-fjg9.onrender.com/api';

interface Params {
  slug: string;
}

// Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/posts/${slug}`);
    const data = await res.json();
    
    if (res.ok && data.success && data.data) {
      const post = data.data;
      const title = `${post.title} | CodeNexus`;
      const description = post.excerpt || 'Read this article on CodeNexus.';
      const keywords = post.seoKeywords ? post.seoKeywords.split(',').map((k: string) => k.trim()) : [];
      const images = post.coverImage ? [post.coverImage] : [];

      return {
        title,
        description,
        keywords,
        openGraph: {
          title,
          description,
          type: 'article',
          images,
          publishedTime: post.createdAt,
          authors: [post.authorId?.name || 'Anonymous'],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images,
        },
      };
    }
  } catch (err) {
    console.error('Failed to generate metadata:', err);
  }
  
  return {
    title: 'CodeNexus | Join the Conversation',
    description: 'The leading space for technical narratives.',
  };
}

// Server Component fetching the initial post data
export default async function ArticleReaderPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  
  let post = null;
  try {
    // Fetch published post. For drafts, API will return 404/fail which we handle by passing null to the client-side component (which then uses client authentication).
    const res = await fetch(`${API}/posts/${slug}`);
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      post = data.data;
    }
  } catch (err) {
    console.error('Failed to pre-fetch article details:', err);
  }

  return <ArticleReaderClient initialPost={post} slug={slug} />;
}
