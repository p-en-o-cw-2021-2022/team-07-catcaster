import Koa from 'koa';
import Router from '@koa/router'; // there is also 'koa-router' (@koa/router is listed officially on koajs)
import serve from 'koa-static';
import mount from 'koa-mount';
import https from 'https';
import http from 'http';
import fs from 'fs';
import * as request from './requesthandlers';
import ws from 'ws';
import { websocketEventHandlers } from './websocket';

/*server*/
/*@Author Thijs*/

const app = new Koa();

const testpath = 'dist/webroot/web'
const router = new Router();

// When we run this server we serve you all of our `dist/webroot` folder.
const webroot = __dirname + '/../../dist/webroot';
app.use(mount('/catcaster', router.routes()));
app.use(mount('/catcaster/screen/', serve(testpath)));
app.use(router.routes()).use(router.allowedMethods())

// Configure some REST points:
router
    .get('/screen/', (ctx: request.context) => {
        request.getScreenPage(ctx);
        //serve page with QR code here;
    })
    .get('/controller/', (ctx: request.context) => {
        request.getControllerPage(ctx);
        //serve page with controls here;
    })
    .get('/game/screen/', (ctx: request.context) => {
        request.getGamePage(ctx);
        //serve game page;
    })
    .get('/loading/screen/', (ctx: request.context) => {
        request.getLoadingPage(ctx);
        //serve loading page;
    })
    .post('/screen/', (ctx: request.context) => {
        request.sendId(ctx);
    })

const options = {
    key: fs.readFileSync('dist/key.pem'),
    cert: fs.readFileSync('dist/cert.pem')
};

export const httpsServer = https.createServer(options, app.callback()).listen(8000, () => console.log('https app staat aan...'));
export const httpServer = http.createServer(app.callback()).listen(3000, () => console.log('http app staat aan...'));

const websocket = new ws.Server({server:httpServer});
websocketEventHandlers(websocket);

