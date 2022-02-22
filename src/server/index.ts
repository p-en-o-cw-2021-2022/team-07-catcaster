import Koa from 'koa';
import Router from '@koa/router'; // there is also 'koa-router' (@koa/router is listed officially on koajs)
import serve from 'koa-static';
import mount from 'koa-mount';
import logger from 'koa-logger';

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
    .post('/notes/:key', (ctx, _next) => {
        ctx.body = 'post';
    })
    .put('/notes/:key', (ctx, _next) => {
        ctx.body = 'put';
    })
    .del('/notes/:key', (ctx, _next) => {
        ctx.body = 'del';
    });

app.use(mount('/api/v0', router.routes())).use(router.allowedMethods());

const port = 4000;
app.listen(4000, () => {
    console.log(`Listening on http://127.0.0.1:${port}/.`);
});