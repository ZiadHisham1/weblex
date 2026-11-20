// components/ProductDescription.tsx
import DOMPurify from 'isomorphic-dompurify';

export function ProductDescription({ html }: { html: string }) {
  if (!html) return null;

  // 1. Sanitize the HTML to remove <script> tags and malicious code
  // But allow styles and standard formatting tags that Eddyter uses
  const cleanHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['style'], // Allow Eddyter's inline styles
    ADD_ATTR: ['class', 'style'], // Allow classes and inline styles
  });

  // 2. Render it
  return (
    <div 
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: cleanHtml }} 
    />
  );
}