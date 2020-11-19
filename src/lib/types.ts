export type Details = {
    mdPath: string;
    mdRelativePath: string;
    htmlPath: string;
    htmlData: Promise<string>;
};

export type TreeNode = Record<string, Details>;
export type Tree = Record<string, TreeNode>;
