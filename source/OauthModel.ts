import { JsonWebTokenError, sign, verify } from 'jsonwebtoken';
import { AuthorizationCode, Client, Token, User } from 'oauth2-server';
import { Action, UnauthorizedError } from 'routing-controllers';

export async function getAuthorizationChecker(action: Action) {
    const authorization: string = action.request.headers['authorization'];

    if (!authorization) throw new UnauthorizedError();

    const token = authorization.replace('Bearer ', '');

    try {
        return verify(token, 'secret');
    } catch (error) {
        if (error instanceof JsonWebTokenError) throw new UnauthorizedError();
    }
}

export async function getClient(clientId: string, clientSecret: string) {
    return {
        id: 'client',
        redirectUris: ['http://localhost:8080/oauth2/callback'],
        grants: ['authorization_code']
    };
}

export async function saveAuthorizationCode(
    code: AuthorizationCode,
    client: Client,
    user: User
) {
    return {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        scope: code.scope,
        client: { id: client.id },
        user: { id: user.id }
    };
}

export async function getAccessToken(accessToken: string) {
    console.log('accessToken', accessToken);
    return {
        accessToken: 'dddd',
        accessTokenExpiresAt: new Date(2022, 9, 1, 0, 0, 0),
        scope: '1',
        client: { id: 'client' },
        user: { id: 1 }
    };
}

export async function getAuthorizationCode(code: string) {
    return {
        code: code,
        expiresAt: new Date(2022, 9, 1, 0, 0, 0),
        redirectUri: 'http://localhost:8080/oauth2/callback',
        scope: '1',
        client: { id: 'client' },
        user: { id: 1 }
    };
}

export async function revokeAuthorizationCode(code: AuthorizationCode) {
    return true;
}

export async function saveToken(token: Token, client: Client, user: User) {
    console.log('token', token);
    console.log('client', client);
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
    console.log(client);
    // console.log(user);
    // console.log(scope);

    return sign({ userAddress: 'xxccxx' }, 'secret', {
        expiresIn: 1000 * 60
    });
}
