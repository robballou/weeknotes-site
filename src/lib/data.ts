import fs from 'fs';
import path from 'path';

import { Tree } from './types';

const isLocal = __dirname.includes('src');

let yearsPromise: Promise<string[]> | null = null;
export async function getYears(): Promise<string[]> {
    if (yearsPromise) {
        return yearsPromise;
    }

    const tree = await getTree();
    yearsPromise = Promise.resolve(Object.keys(tree).reverse());
    return yearsPromise;
}

export function getFilesystemBase() {
    return isLocal ? path.join(__dirname, '../../html') : '';
}

export function getTreeFilePath(): string {
    return path.join(getFilesystemBase(), 'tree.json');
}

let treePromise: Promise<Tree> | null = null;
export function getTree(): Promise<Tree> {
    if (treePromise) {
        return treePromise;
    }
    treePromise = new Promise((resolve, reject) => {
        fs.readFile(getTreeFilePath(), 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }

            const parsedTree = JSON.parse(data) as Tree;
            resolve(parsedTree);
        });
    });
    return treePromise;
}

export async function getTreeItem(path: string) {
    const tree = await getTree();
    const splitPath = path.split('/');
    const yearTree = tree[splitPath[0]];
    if (splitPath.length === 1) {
        return yearTree.index;
    }

    if (Object.prototype.hasOwnProperty.call(yearTree, splitPath[1])) {
        return yearTree[splitPath[1]];
    }
    return null;
}

export async function getMarkdownData(itemPath: string) {
    const item = await getTreeItem(itemPath);
    if (!item) {
        return null;
    }

    return new Promise((resolve, reject) => {
        const file = path.join(getFilesystemBase(), item.htmlPath);
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
}
