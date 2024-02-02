import 'dotenv/config';
import Koa from 'koa';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';

import { onDatabaseConnect } from './config/knex';
import router from './routes';

const app = new Koa();

app.use(cors());
app.use(helmet());
app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

const main = async (): Promise<void> => {
  try {
    await onDatabaseConnect();
    console.log('Database is connected');

    app.listen(Number(process.env.PORT), process.env.HOST, () => {
      console.log(`Server started with port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main()
  .then(() => {})
  .catch((error) => {
    console.log(error);
  });
