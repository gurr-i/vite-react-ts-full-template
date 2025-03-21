#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, '..');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function init() {
  try {
    const projectName = await question('Project name: ');
    const description = await question('Project description: ');
    const author = await question('Author: ');

    const targetDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
      console.error(`Directory ${projectName} already exists!`);
      process.exit(1);
    }

    // Copy template files
    fs.mkdirSync(targetDir, { recursive: true });
    copyDir(templateDir, targetDir, ['node_modules', '.git', 'bin']);

    // Update package.json
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.name = projectName;
    packageJson.description = description;
    packageJson.author = author;
    packageJson.version = '1.0.0';
    delete packageJson.bin;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Initialize git repository
    process.chdir(targetDir);
    execSync('git init', { stdio: 'inherit' });

    console.log('\nInstalling dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log(`\n🎉 Successfully created project ${projectName}`);
    console.log('\nNext steps:');
    console.log(`  cd ${projectName}`);
    console.log('  npm run dev');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function copyDir(src, dest, excludes = []) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (excludes.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

init();