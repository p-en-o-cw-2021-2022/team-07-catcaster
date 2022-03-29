import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs'
import { database } from './index';

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenRedirectPage(ctx: context){
    if (ctx.request.querystring == '') {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/redirectPage/redirectPage.html');
    }
    else {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/screenPage/screenPage.html');
    }
}

export function sendScreenId(ctx: context) {
    let id = database.generateId(8);
    database.addScreen(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getControllerRedirectPage(ctx: context){
    if (ctx.request.querystring == '') {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/controllerRedirect/controllerRedirect.html');
    }
    else {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/controllerPage/controllerPage.html');
    }
}

export function sendControllerId(ctx: context) {
    let id = database.generateId(8);
    database.addController(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getErrorPage(ctx: context) {
    ctx.response.status = 200;
    ctx.type = 'html'
    ctx.body = fs.createReadStream('dist/webroot/web/errorPage/errormessage.html')
}

