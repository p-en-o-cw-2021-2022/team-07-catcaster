import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs'
import { IdDatabase } from './classes';

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenPage(ctx: context){
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/Redirect Page/redirectPage.html'); //replace placeholder
}

export function sendId(ctx: context) {
    let database = new IdDatabase();
    let id = database.generateId(8);
    console.log(8);
    database.addController(id);
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getControllerPage(ctx: context){
    ctx.type = 'html';
    ctx.body = fs.createReadStream('placeholder'); //replace placeholder
}

export function getGamePage(ctx: context){
    ctx.type = 'html';
    ctx.body = fs.createReadStream('placeholder'); //replace placeholder
}

export function getLoadingPage(ctx: context){
    //insert screen.generateId function
    ctx.body = {message: 'loading...'};
}
