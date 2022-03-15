import Koa from 'koa';
import Router from '@koa/router';
import fs from 'fs'
import { database } from './index';

export type context = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext & Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>, unknown>;

export function getScreenRedirectPage(ctx: context){
    ctx.response.status = 200;
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/redirectPage/redirectPage.html'); //replace placeholder
}

export function getScreenPage(ctx: context){
    let screenId: string = ctx.params.id;
    if (!database.doesIdExist(screenId)) {
        ctx.response.status = 401;
        ctx.body = {message: 'Given ID does not exist.'};
    }
    else if (!(screenId in database.getScreenIds())) {
        ctx.response.status = 401;
        ctx.body = {message: 'Given ID is not a screen.'};
    }
    ctx.response.status = 200;
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/screenPage/screenPage.html');
}

export function sendScreenId(ctx: context) {
    let idExist = false;
    while (!idExist) {
        let id = database.generateId(8);
        idExist = database.addScreen(id);
    }
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getControllerRedirectPage(ctx: context){
    ctx.response.status = 200;
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/controllerRedirect/controllerRedirect.html'); //replace placeholder
}

export function getControllerPage(ctx: context) {
    let controllerId: string = ctx.params.id;
    if (!database.doesIdExist(controllerId)) {
        ctx.response.status = 401;
        ctx.body = {message: 'Given ID does not exist.'};
    }
    else if (!(controllerId in database.getControllerIds())) {
        ctx.response.status = 401;
        ctx.body = {message: 'Given ID is not a controller.'};
    }
    ctx.response.status = 200;
    ctx.type = 'html';
    ctx.body = fs.createReadStream('dist/webroot/web/controllerPage/controllerPage.html');
}

export function sendControllerId(ctx: context) {
    let idExist = false;
    while (!idExist) {
        let id = database.generateId(8);
        idExist = database.addController(id);
    }
    ctx.response.status = 200;
    ctx.body = JSON.stringify(id);
}

export function getGamePage(ctx: context){
    ctx.type = 'html';
    ctx.body = fs.createReadStream('placeholder'); //replace placeholder
}

