import Router from '@koa/router';
import { getLastVisits, getVisitsByURL } from '../services/visits';

const visitsRouter = new Router();

visitsRouter
  .get('/', async (ctx) => {
    const userId = ctx.state.userId as number;

    ctx.response.body = await getLastVisits(
      userId,
      Number(ctx.query.limit),
      Number(ctx.query.offset)
    );
  })
  .get('/:id', async (ctx) => {
    const userId = ctx.state.userId as number;

    ctx.response.body = await getVisitsByURL(
      ctx.params.id,
      userId,
      Number(ctx.query.limit),
      Number(ctx.query.offset)
    );
  });

export default visitsRouter;
