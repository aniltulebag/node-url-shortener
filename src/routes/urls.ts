import Router from '@koa/router';

import {
  getURLs,
  createShortURL,
  type CreateShortUrlBody,
  updateURL,
  type UpdateUrlBody,
  deleteURL,
} from '../services/urls';

const urlsRouter = new Router();

urlsRouter
  .get('/', async (ctx) => {
    const userId = ctx.state.userId as number;

    ctx.response.body = await getURLs(
      userId,
      Number(ctx.request.query.limit),
      Number(ctx.request.query.offset)
    );
  })
  .post('/', async (ctx) => {
    const userId = ctx.state.userId as number;

    ctx.response.body = await createShortURL(
      ctx.request.body as CreateShortUrlBody,
      userId
    );
  })
  .put('/:id', async (ctx) => {
    const userId = ctx.state.userId as number;

    ctx.response.body = await updateURL(
      ctx.params.id,
      ctx.request.body as UpdateUrlBody,
      userId
    );
  })
  .delete('/:id', async (ctx) => {
    const userId = ctx.state.userId as number;

    ctx.response.body = await deleteURL(ctx.params.id, userId);
  });

export default urlsRouter;
