import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs';
import { database } from './index';
import {nbusers} from './index';

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenRedirectPage(ctx: context) {
    const params = ctx.request.query;
    if (params.id == null) {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/redirectPage/redirectPage.html');
    } else {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/screenPage/screenPage.html');
    }
}

export function sendScreenId(ctx: context) {
    const id = database.generateId(8);
    database.addScreen(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getControllerRedirectPage(ctx: context) {
    const params = ctx.request.query;
    console.log(params);
    if (params.id == null) {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/controllerRedirect/controllerRedirect.html');
    } else if (params.id != null && params.mode == null){
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/controllerPage/controller-start-screen.html');
    } else if (params.mode == 'multiscreen') {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('placeholder');
    } else if (params.mode == 'singlescreen') {
        ctx.response.status = 200;
        ctx.type = 'html';
        ctx.body = fs.createReadStream('dist/webroot/web/controllerPage/controllerPage.html');
    }
}

export function sendControllerId(ctx: context) {
    const id = database.generateId(8);
    database.addController(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getErrorPage(ctx: context) {
    ctx.response.status = 200;
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/errorPage/errormessage.html');
}
