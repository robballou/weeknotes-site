export function getTitle(path: string) {
    if (path.includes('/')) {
        const pieces = path.split('/');
        const month = pieces[1].substr(0, 2);
        const day = pieces[1].substr(2);
        return `week of ${pieces[0]}-${month}-${day}`;
    }
    return path;
}
