import Express from 'express';
import fs from 'fs';
import path from 'path';

import { getMarkdownData, getYears } from './lib/data';
import { renderFile } from './lib/ejs';
import { return404, return500 } from './lib/errors';
import { validWeek, validYear } from './lib/middleware';
import { getTitle } from './lib/util';

export const app = Express();

app.get('/', async (req: Express.Request, res: Express.Response) => {
    const data = await renderFile(path.join(__dirname, 'index.ejs'), {
        years: await getYears(),
        link: '',
    });
    res.send(data);
});

app.get('/favicon.ico', (req: Express.Request, res: Express.Response) => {
    res.status(404).send();
});

app.get('/build', (req: Express.Request, res: Express.Response) => {
    fs.readFile(path.join(__dirname, 'build'), 'utf8', (err, data) => {
        console.error(err);
        res.send(data ?? 'unknown');
    });
});

app.get('/main.css', (req: Express.Request, res: Express.Response) => {
    res.sendFile(path.join(__dirname, 'main.css'));
});

app.get('/:year', validYear, async (req: Express.Request, res: Express.Response) => {
    const markdownData = await getMarkdownData(req.params.year);
    const data = await renderFile(path.join(__dirname, 'article.ejs'), {
        years: await getYears(),
        title: req.params.year,
        content: markdownData,
        date: '',
        base: `/${req.params.year}/`,
        link: '',
    });
    res.send(data);
});

app.get('/:year/:week', validYear, validWeek, async (req: Express.Request, res: Express.Response) => {
    if (req.params.week.includes('.md')) {
        return res.redirect(`/${req.params.year}/${req.params.week.replace('.md', '')}`);
    }

    const itemPath = `${req.params.year}/${req.params.week.replace('.md', '')}`;
    const markdownData = await getMarkdownData(itemPath);

    if (markdownData === null) {
        return return404(req, res);
    }

    const data = await renderFile(path.join(__dirname, 'article.ejs'), {
        years: await getYears(),
        title: getTitle(itemPath),
        content: markdownData,
        date: '',
        base: `/${req.params.year}/`,
        link: `https://github.com/robballou/weeknotes/blob/main/${itemPath}.md`,
    });
    res.send(data);
});

// eslint-disable-next-line @typescript-eslint/ban-types
app.use(async (err: any, req: Express.Request, res: Express.Response, next: Function) => {
    console.error(`Error for ${req.originalUrl} (${req.method})`);
    console.error(err);
    if (err.message && /Invalid (year|week)/.test(err.message)) {
        return return404(req, res);
    }

    return return500(req, res);
});
