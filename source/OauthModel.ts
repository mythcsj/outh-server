import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import {
    AuthorizationCode,
    Client,
    ServerError,
    Token,
    User
} from 'oauth2-server';
import { Action, UnauthorizedError } from 'routing-controllers';
import dataSource, { OauthClient, OauthCode } from './model';

const { APP_SECRET } = process.env;

export async function getAuthorizationChecker(action: Action) {
    const authorization: string = action.request.headers['authorization'];

    if (!authorization) throw new UnauthorizedError();

    const token = authorization.replace('Bearer ', '');

    try {
        return verify(token, APP_SECRET);
    } catch (error) {
        if (error instanceof JsonWebTokenError) throw new UnauthorizedError();
    }
}

export async function findClient(clientId: string) {
    const oauthClientStore = dataSource.getRepository(OauthClient);
    return await oauthClientStore.findOne({
        where: { clientId }
    });
}

export async function findCode(code: string) {
    const oauthCodeStore = dataSource.getRepository(OauthCode);
    return await oauthCodeStore.findOne({
        where: { code }
    });
}

export async function getClient(clientId: string, clientSecret: string) {
    console.log('getClient-----------------');

    const client = await findClient(clientId);

    if (!client)
        throw new ServerError(
            'Invalid client: `client_id` does not exist, please register the client'
        );

    if (clientSecret && client.clientSecret != clientSecret)
        throw new ServerError(
            'Invalid client: `client_secret` does not match client value'
        );

    return {
        id: client.clientId,
        redirectUris: [client.redirectUrl],
        grants: ['authorization_code']
    };
}

export async function saveAuthorizationCode(
    code: AuthorizationCode,
    client: Client,
    user: User
) {
    console.log('saveAuthorizationCode-----------------');

    const oauthCodeStore = dataSource.getRepository(OauthCode);
    await oauthCodeStore.save({
        code: code.authorizationCode,
        expiresAt: code.expiresAt,
        clientId: client.id
    });

    return {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        scope: code.scope,
        client: { id: client.id },
        user: { id: user.id }
    };
}

export async function getAuthorizationCode(code: string) {
    console.log('getAuthorizationCode-----------------');

    const { clientId, expiresAt } = await findCode(code);
    const client = await findClient(clientId);

    return {
        code,
        expiresAt,
        redirectUri: client.redirectUrl,
        client: { id: clientId },
        user: { userId: client.userId }
    };
}

export async function revokeAuthorizationCode(code: AuthorizationCode) {
    console.log('revokeAuthorizationCode-----------------');
    console.log(code);
    return true;
}

export async function saveToken(token: Token, client: Client, user: User) {
    console.log('saveToken-----------------');
    return {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.accessToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
        client: client,
        user: user
    };
}

export async function generateAccessToken(
    client: Client,
    user: User,
    scope: string
) {
    return sign(user, APP_SECRET, {
        expiresIn: 1000 * 60 * 10
    });
}
