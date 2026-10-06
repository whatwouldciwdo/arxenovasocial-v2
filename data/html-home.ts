import fs from 'fs';
import path from 'path';

const problemsProcessBoundary = '</div></div></div></div></div></div></div></section><section id="process"';
const repairedProblemsProcessBoundary = '</div></div></div></section><section id="process"';

export function getHomeHtml(): string {
  const p = path.join(process.cwd(), 'data', 'home.html');
  const html = fs.readFileSync(p, 'utf8');
  // Auto-fix if user types src="public/..." to src="/..."
  const normalized = html.replace(/src="public\//g, 'src="/').replace(/src=\\"public\//g, 'src=\\"/');
  if (normalized.split(problemsProcessBoundary).length !== 2) {
    throw new Error('Unexpected Problems/Process boundary');
  }
  return normalized.replace(problemsProcessBoundary, repairedProblemsProcessBoundary);
}
