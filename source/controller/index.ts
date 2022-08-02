import { createAPI } from 'koagger';

import { isProduct } from '../model';
import { HomeController } from './Home';
import { UserController } from './User';
import { Oauth2Controller } from './Oauth';

export * from './Home';
export * from './User';
export * from './Oauth';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers: [UserController, HomeController, Oauth2Controller]
});
