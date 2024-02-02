import Router from '@koa/router';
import {
  type RegisterBody,
  register,
  type LoginBody,
  login,
} from '../services/users';

const authRouter = new Router();

authRouter
  .post('/register', async (ctx) => {
    ctx.response.body = await register(ctx.request.body as RegisterBody);
  })
  .post('/login', async (ctx) => {
    ctx.response.body = await login(ctx.request.body as LoginBody);
  });

export default authRouter;
