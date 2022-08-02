import {
    Authorized,
    CurrentUser,
    Get,
    JsonController,
    QueryParam
} from 'routing-controllers';

@JsonController('/oauth2')
export class Oauth2Controller {
    @Get('/callback')
    getcallback(@QueryParam('code') code: string) {
        return `code:${code}`;
    }

    @Get('/user')
    @Authorized()
    getSession(@CurrentUser() user: OauthUser) {
        return { user };
    }
}

export interface OauthUser {
    userAddress: string;
}
