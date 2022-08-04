import { IsDate, IsOptional, IsString, IsUrl } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Base, BaseModel } from '../Base';

export class OauthTokenModel extends BaseModel {
    @IsString()
    token: string;

    @IsString()
    clientId: string;

    @IsDate()
    expiresAt: Date;
}

@Entity()
export class OauthToken extends Base implements OauthTokenModel {
    @Column()
    token: string;

    @Column()
    clientId: string;

    @Column()
    expiresAt: Date;
}
