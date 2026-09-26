import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Compile real JSX with the installed TypeScript/React, not Playwright's CT JSX transform.
const project = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(project, 'artifacts', 'project-process', 'candidate-render');
for (const file of ['components/home/ProjectProcess.tsx', 'components/home/process-artwork.ts', 'data/home/process.ts']) {
  const source = await readFile(path.join(project, file), 'utf8');
  const result = ts.transpileModule(source, { fileName: file, compilerOptions: {
    jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  } });
  const destination = path.join(output, file.replace(/\.tsx?$/, '.js'));
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, result.outputText);
}
const require = createRequire(import.meta.url);
const ProjectProcess = require(path.join(output, 'components/home/ProjectProcess.js')).default;
process.stdout.write(renderToStaticMarkup(React.createElement(ProjectProcess)));
