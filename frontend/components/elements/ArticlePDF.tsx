import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 70,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 50,
    right: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6b7280',
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 1.25,
  },
  metaContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metaText: {
    fontSize: 9,
    color: '#4b5563',
  },
  categoryTag: {
    fontSize: 8,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 10,
    textAlign: 'justify',
  },
  heading2: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginTop: 18,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginTop: 14,
    marginBottom: 6,
  },
  codeBlock: {
    fontFamily: 'Courier',
    fontSize: 8.5,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    borderRadius: 6,
    marginVertical: 12,
    color: '#1f2937',
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginLeft: 15,
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 15,
  },
  image: {
    marginVertical: 12,
    borderRadius: 6,
    maxWidth: '100%',
  },
  coverImage: {
    marginVertical: 15,
    borderRadius: 8,
    maxHeight: 250,
    objectFit: 'cover',
  }
});

function parseHtmlToPdfElements(html: string) {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements: React.ReactNode[] = [];

  doc.body.childNodes.forEach((node, idx) => {
    const el = node as HTMLElement;
    const tagName = el.tagName?.toLowerCase();

    if (!tagName) {
      if (node.textContent?.trim()) {
        elements.push(
          <Text key={idx} style={styles.paragraph}>
            {node.textContent.trim()}
          </Text>
        );
      }
      return;
    }

    if (tagName === 'h1' || tagName === 'h2') {
      elements.push(
        <Text key={idx} style={styles.heading2}>
          {el.textContent}
        </Text>
      );
    } else if (tagName === 'h3') {
      elements.push(
        <Text key={idx} style={styles.heading3}>
          {el.textContent}
        </Text>
      );
    } else if (tagName === 'p') {
      elements.push(
        <Text key={idx} style={styles.paragraph}>
          {el.textContent}
        </Text>
      );
    } else if (tagName === 'pre') {
      elements.push(
        <Text key={idx} style={styles.codeBlock}>
          {el.textContent}
        </Text>
      );
    } else if (tagName === 'img') {
      const src = el.getAttribute('src');
      if (src) {
        elements.push(
          <Image key={idx} src={src} style={styles.image} />
        );
      }
    } else if (tagName === 'ul' || tagName === 'ol') {
      el.childNodes.forEach((liNode, liIdx) => {
        if (liNode.textContent?.trim()) {
          elements.push(
            <Text key={`${idx}-${liIdx}`} style={styles.listItem}>
              • {liNode.textContent.trim()}
            </Text>
          );
        }
      });
    } else if (tagName === 'hr') {
      elements.push(<View key={idx} style={styles.divider} />);
    } else if (el.textContent?.trim()) {
      elements.push(
        <Text key={idx} style={styles.paragraph}>
          {el.textContent.trim()}
        </Text>
      );
    }
  });

  return elements;
}

interface ArticlePDFProps {
  post: any;
  authorName: string;
}

export default function ArticlePDF({ post, authorName }: ArticlePDFProps) {
  const contentBlocks = parseHtmlToPdfElements(post.htmlContent || '');
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headerTitle = post.title && post.title.length > 40 ? post.title.slice(0, 40) + '...' : post.title;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Recurring Header */}
        <View style={styles.header} fixed>
          <Text>CodeNexus Engineering Blog</Text>
          <Text style={{ maxWidth: 220 }}>
            {headerTitle}
          </Text>
        </View>

        {/* Article Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Meta Info bar */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            By {authorName}  •  {formattedDate}
          </Text>
          {post.category && (
            <Text style={styles.categoryTag}>{post.category}</Text>
          )}
        </View>

        {/* Cover Image */}
        {post.coverImage && (
          <Image src={post.coverImage} style={styles.coverImage} />
        )}

        {/* Content Body */}
        <View>
          {contentBlocks}
        </View>

        {/* Recurring Footer */}
        <View style={styles.footer} fixed>
          <Text>codenexus.com</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
