import Koa from 'koa';
import Router from '@koa/router'; // there is also 'koa-router' (@koa/router is listed officially on koajs)
import serve from 'koa-static';
import mount from 'koa-mount';
import logger from 'koa-logger';
import https from 'https';
import http from 'http';
import fs from 'fs';

const app = new Koa();

// Log all requests to the screen such that we see what is happening
app.use(logger());

// When we run this server we serve you all of our `dist/webroot` folder.
const webroot = __dirname + '/../../dist/webroot';
app.use(mount('/', serve(webroot)));

// Configure some REST points:
const router = new Router();
router
    .get('/screen/', (ctx, _next) => {
        //serve page with QR code here;
    })
    .get('/controller/', (ctx, _next) => {
        //serve page with controls here;
    })
    .get('/game/screen/', (ctx, _next) => {
        //serve game page;
    })


app.use(mount('/catcaster/', router.routes())).use(router.allowedMethods());

const options = {
    key: fs.readFileSync('dist/key.pem'),
    cert: fs.readFileSync('dist/cert.pem')
};

export const httpsServer = https.createServer(options, app.callback()).listen(8000, () => console.log('https app staat aan...'));
export const httpServer = http.createServer(app.callback()).listen(3000, () => console.log('http app staat aan...'));