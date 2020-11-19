import Express from 'express';

// eslint-disable-next-line @typescript-eslint/ban-types
export function validYear(req: Express.Request, res: Express.Response, next: Function) {
    if (req.params.year && /^0?\d{4}$/.test(req.params.year)) {
        return next();
    }
    throw new Error(`Invalid year: ${req.params.year}`);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function validWeek(req: Express.Request, res: Express.Response, next: Function) {
    if (req.params.week && /^\d{4}(\.md)?$/.test(req.params.week)) {
        return next();
    }
    throw new Error(`Invalid week: ${req.params.week}`);
}
