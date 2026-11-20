'use client';

export function Icon({
  svg,
  className = '',
  strokeWidth,
}: {
  svg?: string;
  className?: string;
  strokeWidth?: number;
}) {
  if (!svg) {
    return (
      <span
        className={`${className} rounded bg-red-500/30`}
        title="missing icon"
      />
    );
  }

  let markup = svg;
  markup = markup.replace(/\s(width|height)="[^"]*"/g, '');
  if (!/viewBox=/.test(markup)) {
    markup = markup.replace(/<svg /, '<svg viewBox="0 0 24 24" ');
  }
  // force colors to inherit
  markup = markup.replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
  markup = markup.replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"');
  if (strokeWidth != null) {
    markup = /stroke-width=/.test(markup)
      ? markup.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`)
      : markup.replace(/<svg /, `<svg stroke-width="${strokeWidth}" `);
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}