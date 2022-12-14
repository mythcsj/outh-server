import { createHash } from 'crypto';
import { sign } from 'jsonwebtoken';
import {
    Authorized,
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    JsonController,
    Param,
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import dataSource, { SignInData, SignUpData, User, UserModel } from '../model';

const { APP_SECRET } = process.env;

@JsonController('/user')
export class UserController {
    store = dataSource.getRepository(User);

    static encrypt(raw: string) {
        return createHash('sha1')
            .update(APP_SECRET + raw)
            .digest('hex');
    }

    @Get('/session')
    @Authorized()
    @ResponseSchema(UserModel)
    getSession(@CurrentUser() user: UserModel) {
        return user;
    }

    @Post('/session')
    @ResponseSchema(UserModel)
    async signIn(@Body() { email, password }: SignInData): Promise<UserModel> {
        const user = await this.store.findOne({
            where: {
                email,
                password: UserController.encrypt(password)
            }
        });
        if (!user) throw new ForbiddenError();

        return { ...user, token: sign({ ...user }, APP_SECRET) };
    }

    @Get('/:id')
    @ResponseSchema(UserModel)
    getOne(@Param('id') id: number) {
        return this.store.findOne({ where: { id } });
    }

    @Post()
    @ResponseSchema(UserModel)
    async signUp(@Body() data: SignUpData) {
        const { password, ...user } = await this.store.save(
            Object.assign(new User(), data, {
                password: UserController.encrypt(data.password)
            })
        );
        return user;
    }

    @Get()
    getList() {
        return this.store.find();
    }
}
