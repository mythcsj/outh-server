import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    JsonController,
    Post,
    QueryParam
} from 'routing-controllers';
import { v4 as uuidv4 } from 'uuid';
import dataSource, {
    OauthClient,
    OauthClientInModel,
    OauthCode
} from '../model';

@JsonController('/oauth2')
export class Oauth2Controller {
    oauthClientStore = dataSource.getRepository(OauthClient);

    oauthCodeStore = dataSource.getRepository(OauthCode);

    @Get('/callback')
    getcallback(@QueryParam('code') code: string) {
        return `code:${code}`;
    }

    @Get('/user')
    @Authorized()
    getUser(@CurrentUser() user: OauthUser) {
        return { user };
    }

    @Post('/client')
    async saveClient(@Body() { userId, redirectUrl }: OauthClientInModel) {
        const client = await this.oauthClientStore.findOne({
            where: { userId }
        });
        if (client) return client;

        return await this.oauthClientStore.save({
            userId,
            clientId: uuidv4().replace(/-/g, ''),
            clientSecret: uuidv4().replace(/-/g, ''),
            redirectUrl
        });
    }
}

export interface OauthUser {
    userId: string;
}
