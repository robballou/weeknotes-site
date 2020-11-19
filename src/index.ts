import { createServer } from 'http';
import morgan from 'morgan';

import { app } from './app';

app.use(morgan('combined'));

const server = createServer(app).listen(process.env.PORT || 80);

process.on('SIGINT', shutdown);

// Do graceful shutdown
function shutdown() {
    console.log('graceful shutdown express');
    server.close(function () {
        console.log('closed express');
    });
}
