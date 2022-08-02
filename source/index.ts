import 'dotenv/config';
import 'reflect-metadata';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';
import KoaLogger from 'koa-logger';
import Router from 'koa-router';
import { useKoaServer } from 'routing-controllers';

import OAuth2Server, { UnauthorizedRequestError } from 'oauth2-server';

import { mocker, router, swagger } from './controller';
import dataSource, { isProduct } from './model';
import { getAuthorizationChecker } from './OauthModel';

const { PORT = 8080, APP_SECRET } = process.env;

const HOST = `http://localhost:${PORT}`,
    app = new Koa()
        .use(KoaLogger())
        .use(swagger())
        .use(jwt({ secret: APP_SECRET, passthrough: true }));

if (!isProduct) app.use(mocker());

app.use(bodyParser());

const oauth = new OAuth2Server({
    model: require('./OauthModel'),
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 4 * 60 * 60
});

var koaRouter = new Router();
koaRouter.get('/authorize', async ctx => {
    const request = new OAuth2Server.Request({
        method: ctx.request.method,
        query: ctx.request.query,
        headers: ctx.request.headers
    });
    const response = new OAuth2Server.Response({
        status: ctx.response.status,
        headers: ctx.response.headers
    });
    try {
        ctx.state.oauth = {
            code: await oauth.authorize(request, response)
        };
        ctx.body = response.body;
        ctx.status = response.status;
        ctx.set(response.headers);
    } catch (e) {
        if (e instanceof UnauthorizedRequestError) {
            ctx.status = e.code;
        } else {
            ctx.body = { error: e.name, error_description: e.message };
            ctx.status = e.code;
        }

        return ctx.app.emit('error', e, ctx);
    }
});

koaRouter.post('/token', async ctx => {
    const request = new OAuth2Server.Request({
        method: ctx.request.method,
        query: ctx.request.query,
        headers: ctx.request.headers,
        body: ctx.request.body
    });
    const response = new OAuth2Server.Response({
        status: ctx.response.status,
        headers: ctx.response.headers
    });
    try {
        ctx.state.oauth = {
            token: await oauth.token(request, response)
        };
        ctx.body = response.body;
        ctx.status = response.status;

        ctx.set(response.headers);
    } catch (e) {
        if (e instanceof UnauthorizedRequestError) {
            ctx.status = e.code;
        } else {
            ctx.body = { error: e.name, error_description: e.message };
            ctx.status = e.code;
        }

        return ctx.app.emit('error', e, ctx);
    }
});

koaRouter.use(async (ctx, next) => {
    const request = new OAuth2Server.Request({
        method: ctx.request.method,
        query: ctx.request.query,
        headers: ctx.request.headers,
        body: ctx.request.body
    });
    const response = new OAuth2Server.Response({
        status: ctx.response.status,
        headers: ctx.response.headers
    });
    try {
        ctx.state.oauth = {
            token: await oauth.authenticate(request, response)
        };
        await next();
    } catch (e) {
        if (e instanceof UnauthorizedRequestError) {
            ctx.status = e.code;
        } else {
            ctx.body = { error: e.name, error_description: e.message };
            ctx.status = e.code;
        }
    }
});
app.use(koaRouter.routes()).use(koaRouter.allowedMethods());

useKoaServer(app, {
    ...router,
    cors: true,
    authorizationChecker: action => !!getAuthorizationChecker(action),
    currentUserChecker: getAuthorizationChecker
});

console.time('Server boot');

dataSource.initialize().then(() =>
    app.listen(PORT, () => {
        console.log(`
HTTP served at ${HOST}
Swagger API served at ${HOST}/docs/`);

        if (!isProduct) console.log('Mock API served at ${HOST}/mock/\n');

        console.timeEnd('Server boot');
    })
);
