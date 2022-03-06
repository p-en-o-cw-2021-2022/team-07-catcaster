import Koa from 'koa';
import Router from '@koa/router'; // there is also 'koa-router' (@koa/router is listed officially on koajs)
import serve from 'koa-static';
import mount from 'koa-mount';
import logger from 'koa-logger';

// Simple example of statically serving our webroot
// and handling some REST calls. Of course you want
// to design your secret message board app by structuring
// it around different files.
// For sure you need to think about which source files will
// also be needed at the frontend in the browser (and where
// to place them). You can have a look at the feature/sensors-experiments
// and feature/webrtc-walkie-talkie to understand how you can do that.

// You can run this file by doing
//  DEBUG=koa-mount npx ts-node src/server/index.ts
// It will start a http webserver on port 4000.
// If you check out the demo branch for WebRTC and there do
//  npm run tsc-web
//  npm run copy-files web
// Then you could start your koa server here and go to
//  http://127.0.0.1:4000/web/WebRTC.M0/
// to see a demo page where you can turn on your camera.
// If you go to
//  http://127.0.0.1:4000/api/v0/
// you should see a hello world message from the v0 api.
// If you go to
//  http://127.0.0.1:4000/api/v0/notes/33
// you should get the message 'Here is note 33'.

// For testing the REST API have a look here: https://mherman.org/blog/building-a-restful-api-with-koa-and-postgres/
// Of course: testing your data structure should be separate from testing the REST api.

const app = new Koa();

// Log all requests to the screen such that we see what is happening
app.use(logger());

// When we run this server we serve you all of our `dist/webroot` folder.
const webroot = __dirname + '/../../dist/webroot';
app.use(mount('/', serve(webroot)));
console.log(`Statically serving ${webroot}. Caveat: put a slash after a path: e.g. http://127.0.0.1:4000/web/WebRTC.M0/`);

// You can put your /REST.M1/ pages etc either in the static `src/web` and serve by the above serve(webroot)
// or you could use the koa app to route this differently/elsewhere.
// Note the assignment first said to use /demo/REST.M1/ but to be consistent with the other features just use /REST.M1/

// Configure some REST points:
const api_v0 = new Router();
api_v0
    .get('/', (ctx, _next) => {
        ctx.body = 'Hello world from api v0!';
    })
    .get('/notes/:key', (ctx, _next) => {
        const { key } = ctx.params;
        ctx.body = `Here is note ${key}!`;
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

app.use(mount('/api/v0', api_v0.routes())).use(api_v0.allowedMethods());

const port = 4000;
app.listen(4000, () => {
    console.log(`Listening on http://127.0.0.1:${port}/.`);
});