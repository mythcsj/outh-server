import { IsString, IsUrl } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Base, BaseModel } from '../Base';

export class OauthClientInModel extends BaseModel {
    @IsString()
    userId: string;

    @IsUrl()
    redirectUrl: string;
}

export class OauthClientModel extends OauthClientInModel {
    @IsString()
    clientId: string;

    @IsString()
    clientSecret: string;
}

@Entity()
export class OauthClient extends Base implements OauthClientModel {
    @Column()
    userId: string;

    @Column()
    clientId: string;

    @Column()
    clientSecret: string;

    @Column()
    redirectUrl: string;
}
