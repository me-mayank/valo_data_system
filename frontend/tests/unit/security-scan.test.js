import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe('Frontend Security & Secret Isolation Scan (Acceptance Criterion)', () => {
  const frontendRoot = path.resolve(__dirname, '../../');
  const srcDir = path.join(frontendRoot, 'src');
  const packageJsonPath = path.join(frontendRoot, 'package.json');

  it('verifies frontend package.json contains NO mongoose dependency', () => {
    const pkgContent = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(pkgContent);

    expect(pkg.dependencies?.mongoose).toBeUndefined();
    expect(pkg.devDependencies?.mongoose).toBeUndefined();
  });

  it('verifies frontend source files contain NO MONGODB_URI or AUTH_SECRET references', () => {
    const files = getAllFiles(srcDir).filter((f) => /\.(js|jsx|mjs|css|json)$/.test(f));

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      expect(
        content.includes('MONGODB_URI'),
        `Forbidden secret reference 'MONGODB_URI' detected in frontend file: ${path.relative(frontendRoot, file)}`
      ).toBe(false);

      expect(
        content.includes('AUTH_SECRET'),
        `Forbidden secret reference 'AUTH_SECRET' detected in frontend file: ${path.relative(frontendRoot, file)}`
      ).toBe(false);

      expect(
        content.includes("from 'mongoose'") || content.includes('from "mongoose"'),
        `Forbidden import 'mongoose' detected in frontend file: ${path.relative(frontendRoot, file)}`
      ).toBe(false);
    }
  });
});
