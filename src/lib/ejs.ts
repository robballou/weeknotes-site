import ejs from 'ejs';

export async function renderFile(file: string, data: Record<string, unknown>) {
    return new Promise((resolve, reject) => {
        ejs.renderFile(file, data, (err, rendered) => {
            if (err) {
                return reject(err);
            }
            return resolve(rendered);
        });
    });
}
