import { IsDate, IsOptional, IsString, IsUrl } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { Base, BaseModel } from '../Base';

export class OauthCodeModel extends BaseModel {
    @IsString()
    code: string;

    @IsString()
    clientId: string;

    @IsDate()
    expiresAt: Date;
}

@Entity()
export class OauthCode extends Base implements OauthCodeModel {
    @Column()
    code: string;

    @Column()
    clientId: string;

    @Column()
    expiresAt: Date;
}
