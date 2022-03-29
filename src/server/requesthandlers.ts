import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs';
import { database } from './index';

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenRedirectPage(ctx: context) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/redirectPage/redirectPage.html'); //replace placeholder
}

export function getScreenPage(ctx: context) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/screenPage/screenPage.html');
}

export function sendScreenId(ctx: context) {
    const id = database.generateId(8);
    database.addScreen(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getControllerRedirectPage(ctx: context) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/controllerRedirect/controllerRedirect.html'); //replace placeholder
}

export function getControllerPage(ctx: context) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/controllerPage/controllerPage.html');
}

export function sendControllerId(ctx: context) {
    const id = database.generateId(8);
    database.addController(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getGamePage(ctx: context) {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('placeholder'); //replace placeholder
}

