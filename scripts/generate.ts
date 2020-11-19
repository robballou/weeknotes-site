import Debug from 'debug';
import fs from 'fs';
import hljs from 'highlight.js';
import marked from 'marked';
import { join } from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';

import { Details, Tree, TreeNode } from '../src/lib/types';

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const writefile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const rimrafPromise = promisify(rimraf);

const d = Debug('weeknotes:generate');

async function main(args: string[]) {
    const base = args[0];
    const buildDirectory = join(__dirname, '..', 'html');
    await rimrafPromise(buildDirectory);
    const tree: Tree = {};
    await readDirectory(base, tree);

    const promises = [];
    Object.entries(tree)
        .forEach(([year, node]: [string, TreeNode]) => {
            Object.entries(node)
                .forEach(([yearItem, itemNode]: [string, Details]) => {
                    promises.push(writeHtml(itemNode, year, buildDirectory));
                });
            });
    promises.push(writeTree(buildDirectory, tree));
    await Promise.all(promises);
}

async function writeTree(buildDirectory: string, tree: Tree) {
    await mkdir(buildDirectory, { recursive: true, mode: 0o755 });
    const treeFile = join(buildDirectory, 'tree.json');
    d('creating tree file', treeFile);
    return writefile(treeFile, JSON.stringify(tree, null, 4), 'utf8');
}

async function writeHtml(node: Details, year: string, buildDirectory: string) {
    d('creating directory', join(buildDirectory, year));
    await mkdir(join(buildDirectory, year), { recursive: true, mode: 0o755 });
    d('creating file', join(buildDirectory, node.htmlPath));
    await writefile(join(buildDirectory, node.htmlPath), await node.htmlData, 'utf8');
}

async function convertMarkdown(markdownFile: string) {
    const markdown = await readfile(markdownFile, 'utf8');
    const html = marked(markdown, {
        highlight: (code, language) => {
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            return hljs.highlight(validLanguage, code).value;
        },
    });
    return html;
}

async function readDirectory(base: string, tree: Tree) {
    const items = await readdir(base);
    const promises: Promise<boolean>[] = [];
    items.filter(item => /\d{4}/.test(item))
        .forEach((item) => promises.push(readYearDirectory(base, tree, item)));
    return Promise.all(promises);
}

async function readYearDirectory(base: string, tree: Tree, item: string) {
    try {
        const yearDirectoryItems = await readdir(join(base, item));
        tree[item] = {};
        yearDirectoryItems.forEach(yearItem => {
            const treeIndex = yearItem === 'README.md' ? 'index' : yearItem.replace('.md', '');
            tree[item][treeIndex] = {
                htmlPath: join(item, yearItem.replace('.md', '.html')),
                mdRelativePath: join(item, yearItem),
                mdPath: join(base, item, yearItem),
                htmlData: convertMarkdown(join(base, item, yearItem)),
            };
        });
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}

main(process.argv.slice(2));
