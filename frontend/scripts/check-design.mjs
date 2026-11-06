#!/usr/bin/env node
// scripts/check-design.mjs
// Enforces the Utilitarian design rules (PRD §10.7) in src/components and src/app.
//
// Fails on:
//  1. Tailwind classes: rounded-, shadow-, gradient-, blur-, animate-
//  2. Tailwind transition duration > 100ms: duration-150, duration-200, etc.
//  3. Hard-coded hex colour values (#xxx or #xxxxxx) in .jsx/.js files
//     (globals.css is excluded because that is where tokens are defined)
//
// Exit code 0 = all clear, 1 = violations found.

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..', 'src');

/** @type {Array<{ pattern: RegExp, message: string, excludeFile?: RegExp }>} */
const RULES = [
  {
    pattern: /\brounded(?:-[a-z0-9]+)?\b/g,
    message: 'No border-radius allowed (rounded- class). Use border-radius: 0 (PRD §10.7).',
  },
  {
    pattern: /\bshadow(?:-[a-z0-9]+)?\b/g,
    message: 'No box-shadow allowed (shadow- class). (PRD §10.7).',
  },
  {
    pattern: /\b(?:bg-)?gradient(?:-[a-z0-9]+)?\b/g,
    message: 'No gradients allowed (PRD §10.7).',
  },
  {
    pattern: /\b(?:backdrop-)?blur(?:-[a-z0-9]+)?\b/g,
    message: 'No blur effects allowed (PRD §10.7).',
  },
  {
    pattern: /\banimate-[a-z0-9-]+\b/g,
    message: 'No decorative animation allowed (animate- class). (PRD §10.7).',
  },
  {
    // duration-150 and above are >100ms (100ms is the max per PRD §10.4)
    pattern: /\bduration-(?:150|200|300|500|700|1000)\b/g,
    message: 'Transition duration > 100ms not allowed (PRD §10.4). Use duration-75 or duration-100.',
  },
  {
    // Bare hex values in JSX/JS files (not in globals.css)
    pattern: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6,8})\b/g,
    message: 'Hard-coded hex value. Use CSS token variables only (PRD §10.7).',
    excludeFile: /globals\.css$/,
  },
];

let violations = 0;

/**
 * Recursively collect all .js/.jsx files under a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      results.push(...collectFiles(full));
    } else if (['.js', '.jsx', '.mjs'].includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(ROOT);

for (const file of files) {
  const relPath = relative(join(__dirname, '..'), file);
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for block comment delimiters
    if (inBlockComment) {
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      continue;
    }
    if (trimmed.startsWith('//')) {
      continue;
    }

    // Strip inline JS and JSX comments for code evaluation
    let line = rawLine
      .replace(/\/\/.*$/, '')
      .replace(/\{\/\*.*?\*\/\}/g, '');

    for (const rule of RULES) {
      if (rule.excludeFile && rule.excludeFile.test(file)) continue;

      let match;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(line)) !== null) {
        if (rawLine.includes('check:design-ignore')) continue;
        console.error(
          `\x1b[31mDESIGN VIOLATION\x1b[0m ${relPath}:${i + 1}:${match.index + 1}\n` +
          `  Found: \x1b[33m${match[0]}\x1b[0m\n` +
          `  Rule:  ${rule.message}\n`
        );
        violations++;
      }
    }
  }
}

if (violations === 0) {
  console.log('\x1b[32m✓ check:design passed — no violations found.\x1b[0m');
  process.exit(0);
} else {
  console.error(`\x1b[31m✗ check:design failed — ${violations} violation(s) found.\x1b[0m`);
  process.exit(1);
}
