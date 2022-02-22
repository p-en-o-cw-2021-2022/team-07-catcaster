import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs'

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenPage(ctx: context){
    console.log(8)
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/index.html'); //replace placeholder
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
