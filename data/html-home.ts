import fs from 'fs';
import path from 'path';

export function getHomeHtml(): string {
  const p = path.join(process.cwd(), 'data', 'home.html');
  const html = fs.readFileSync(p, 'utf8');
  // Auto-fix if user types src="public/..." to src="/..."
  return html.replace(/src="public\//g, 'src="/').replace(/src=\\"public\//g, 'src=\\"/');
}

export const HOME_HTML = getHomeHtml();
