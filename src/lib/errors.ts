import Express from 'express';
import path from 'path';

import { getYears } from './data';
import { renderFile } from './ejs';

export async function return404(req: Express.Request, res: Express.Response) {
    const data = await renderFile(path.join(__dirname, '../error.ejs'), {
        years: await getYears(),
        title: 'Page not found',
        content: 'Page not found',
        date: '',
        base: req.params.year ? `/${req.params.year}` : '',
        link: '',
    });

    return res
        .status(404)
        .send(data)
    ;
}
export async function return500(req: Express.Request, res: Express.Response) {
    const data = await renderFile(path.join(__dirname, '../error.ejs'), {
        years: await getYears(),
        title: 'Server Error',
        content: 'Server Error',
        date: '',
        base: req.params.year ? `/${req.params.year}` : '',
        link: '',
    });

    return res
        .status(500)
        .send(data)
    ;
}
