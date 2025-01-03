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
import { IdDatabase } from './classes';

/*server*/
/*@Author Thijs*/

const app = new Koa();

const redirectPage = 'dist/webroot/web/redirectPage';
const screenPage = 'dist/webroot/web/screenPage';
const controllerRedirect = 'dist/webroot/web/controllerRedirect';
const controllerPage = 'dist/webroot/web/controllerPage';
const animation = 'dist/webroot/web/js';
const startscreen_controller = 'dist/webroot/web/QR-test';
const errorMessage = 'dist/webroot/web/errorPage';
const endGamePage = 'dist/webroot/web/endGamePage';
const menuInGame = 'dist/webroot/web/menuInGame';
const models = 'dist/webroot/web/models';
const router = new Router();

// When we run this server we serve you all of our `dist/webroot` folder.
const webroot = __dirname + '/../../dist/webroot';
app.use(mount('/catcaster/screen/', serve(redirectPage)));
app.use(mount('/catcaster/screen/', serve(screenPage)));
app.use(mount('/catcaster/controller/', serve(controllerRedirect)));
app.use(mount('/catcaster/controller/', serve(controllerPage)));
app.use(mount('/catcaster/error/', serve(errorMessage)));
app.use(mount('/catcaster/js/', serve(animation)));
app.use(mount('/catcaster/controller/', serve(startscreen_controller)));
app.use(mount('/catcaster/menu/', serve(menuInGame)));
app.use(mount('/catcaster/endgame/', serve(endGamePage)));
app.use(mount('/catcaster/screen/', serve(models)));
app.use(router.routes()).use(router.allowedMethods());

export var database = new IdDatabase();
export var nbusers = 0;

// Configure some REST points:
router
    .get('/catcaster/screen', (ctx: request.context) => {
        request.getScreenRedirectPage(ctx);
        //serve page with QR code here;
    })
    .get('/catcaster/controller/', (ctx: request.context) => {
        request.getControllerRedirectPage(ctx);
        //serve page with controls here;
    })
    .get('/catcaster/error/', (ctx: request.context) => {
        request.getErrorPage(ctx);
    })
    .get('/catcaster/menu/', (ctx: request.context) => {
        request.getMenuPage(ctx);
    })
    .get('/catcaster/endgame/', (ctx:request.context) => {
        request.getEndGame(ctx);
    })
    .post('/catcaster/screen/', (ctx: request.context) => {
        request.sendScreenId(ctx);
    })
    .post('/catcaster/controller/', (ctx:request.context) => {
        request.sendControllerId(ctx);
    });

const options = {
    key: fs.readFileSync('dist/webroot/web/key.pem'),
    cert: fs.readFileSync('dist/webroot/web/cert.pem')
};

export const httpsServer = https.createServer(options, app.callback()).listen(8000, () => console.log('https app staat aan...'));
export const httpServer = http.createServer(app.callback()).listen(3000, () => console.log('http app staat aan...'));

const websocket = new ws.Server({server:httpsServer});
websocketEventHandlers(websocket);

