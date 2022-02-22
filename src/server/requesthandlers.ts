import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs'

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenPage(ctx: context){
    ctx.type = 'html';
    fs.createReadStream('placeholder'); //replace placeholder
}

export function getControllerPage(ctx: context){
    ctx.type = 'html';
    fs.createReadStream('placeholder'); //replace placeholder
}

export function getGamePage(ctx: context){
    ctx.type = 'html';
    fs.createReadStream('placeholder'); //replace placeholder
}
