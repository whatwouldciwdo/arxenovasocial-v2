import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const output = path.resolve('artifacts/problems/candidate-render');
for (const file of ['components/home/ProblemsSection.tsx', 'data/home/problems.ts']) {
  const result = ts.transpileModule(await readFile(file, 'utf8'), { fileName: file, compilerOptions: {
    jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } });
  const target = path.join(output, file.replace(/\.tsx?$/, '.js'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, result.outputText);
}
const Component = createRequire(import.meta.url)(path.join(output, 'components/home/ProblemsSection.js')).default;
process.stdout.write(renderToStaticMarkup(React.createElement(Component)));
