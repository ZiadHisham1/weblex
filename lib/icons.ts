import fs from 'fs';
import path from 'path';

export function loadIcons(names: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const name of names) {
    const file = name.endsWith('.svg') ? name : `${name}.svg`;
    const full = path.join(process.cwd(), 'public', 'icons', file);
    try {
      let svg = fs.readFileSync(full, 'utf8');
      // strip fixed dimensions so CSS controls size
      svg = svg.replace(/\s(width|height)="[^"]*"/g, '');
      // ensure viewBox
      if (!/viewBox=/.test(svg)) {
        svg = svg.replace(/<svg /, '<svg viewBox="0 0 24 24" ');
      }
      map[name] = svg;
    } catch {
      // silently skip missing files; Icon will render a placeholder
    }
  }
  return map;
}

export const SIDEBAR_ICONS = [
  'home.svg',
  'inbox_icon.svg',
  'products.svg',
  'customers.svg',
  'growth.svg',
  'discounts.svg',
  'content.svg',
  'markets.svg',
  'analytics.svg',
  'FileText.svg',
  'Palette.svg',
  'ImageIcon.svg',
  'Package.svg',
  'Package2.svg',
  'Layers.svg',
  'ShoppingCart.svg',
  'Calendar.svg',
  'Users.svg',
  'Mail.svg',
  'Settings.svg',
  'trash.svg'
];