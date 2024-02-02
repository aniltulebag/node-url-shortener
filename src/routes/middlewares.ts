import createHttpError from 'http-errors';
import type { RouterContext } from '@koa/router';
import type { Next } from 'koa';
import { validateJWT } from '../config/jwt';

export const requireAuthHandler = async (
  ctx: RouterContext,
  next: Next
): Promise<void> => {
  const header = ctx.request.headers.authorization;

  if (header === undefined) {
    throw new createHttpError.Unauthorized('Please provide a token');
  }

  const token = header.split(' ')[1];
  const tokenPayload = await validateJWT(token);

  ctx.state.userId = Number(tokenPayload.id);

  await next();
};
