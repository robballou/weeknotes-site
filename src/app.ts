import Express from 'express';
import fs from 'fs';
import path from 'path';

import { getMarkdownData, getYears } from './lib/data';
import { renderFile } from './lib/ejs';
import { validWeek, validYear } from './lib/middleware';

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
        res.send(data ?? '');
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
    const data = await renderFile(path.join(__dirname, 'article.ejs'), {
        years: await getYears(),
        title: itemPath,
        content: markdownData,
        date: '',
        base: `/${req.params.year}/`,
        link: `https://github.com/robballou/weeknotes/blob/main/${itemPath}.md`,
    });
    res.send(data);
});

// eslint-disable-next-line @typescript-eslint/ban-types
app.use(async (err: any, req: Express.Request, res: Express.Response, next: Function) => {
    console.error(err);
    if (err.message && err.message.includes('Invalid year')) {
        const data = await renderFile(path.join(__dirname, 'error.ejs'), {
            years: await getYears(),
            title: 'Page not found',
            content: 'Page not found',
            date: '',
            base: `/${req.params.year}/`,
            link: '',
        });
        return res
            .status(404)
            .send(data)
        ;
    }

    const data = await renderFile(path.join(__dirname, 'error.ejs'), {
        years: await getYears(),
        title: 'Server error',
        content: 'Server error',
        date: '',
        base: `/${req.params.year}/`,
        link: '',
    });
    return res.status(500).send(data);
});
