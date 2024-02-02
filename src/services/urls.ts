import createHttpError from 'http-errors';
import type { Url } from '../types';

import { validateCreateShortURL, validateUpdateShortURL } from './validations';
import knex from '../config/knex';
import { registerVisit } from './visits';

export interface CreateShortUrlBody {
  url: string;
  id?: string;
}

export const createShortURL = async (
  body: CreateShortUrlBody,
  userId: number
): Promise<Url> => {
  validateCreateShortURL(body);

  if (!(body.id === undefined) && !(body.id.length === 0)) {
    const currentRecord = await knex('urls').where({ id: body.id }).first();

    if (!(currentRecord === undefined)) {
      throw new createHttpError.Conflict(
        'The ID that you provided already exists in our database'
      );
    }
  }

  const results = await knex('urls').insert(
    {
      url: body.url,
      id: body.id,
      user_id: userId,
    },
    '*'
  );

  return results[0];
};

export const resolveURL = async (id: string, ip: string): Promise<string> => {
  const url = await knex('urls')
    .where({
      id,
    })
    .select('url')
    .first();

  console.log('url', url);

  if (url === undefined) {
    throw new createHttpError.NotFound('URL is not found');
  }

  await registerVisit(id, ip);

  return url.url;
};

export interface UpdateUrlBody {
  url: string;
}

export const updateURL = async (
  id: string,
  body: UpdateUrlBody,
  userId: number
): Promise<Partial<Url>> => {
  validateUpdateShortURL(body);

  const url = await knex('urls')
    .where({
      id,
    })
    .select('user_id')
    .first();

  if (url === undefined) {
    throw new createHttpError.NotFound('URL is not found');
  }

  if (url.user_id !== userId) {
    throw new createHttpError.Unauthorized(
      "You don't have permissions to update this URL"
    );
  }

  const results = await knex('urls')
    .where({
      id,
    })
    .update('url', body.url, '*');

  return results[0];
};

export const deleteURL = async (
  id: string,
  userId: number
): Promise<boolean> => {
  const url = await knex('urls')
    .where({
      id,
    })
    .select('user_id')
    .first();

  if (url === undefined) {
    throw new createHttpError.NotFound('URL is not found');
  }

  if (url.user_id !== userId) {
    throw new createHttpError.Unauthorized(
      "You don't have permissions to update this URL"
    );
  }

  await knex('urls')
    .where({
      id,
    })
    .delete('*');

  return true;
};

export const getURLs = async (
  userId: number,
  limit: number,
  offset: number
): Promise<Url[]> => {
  // Select from the `urls` tables where the `user_id` equals the userId, who created this URL
  const results = await knex('urls')
    .where({
      user_id: userId,
    })
    // Then left join with the `visits` table on `urls.id` equals `visits.url_id`
    .leftJoin('visits', 'urls.id', 'visits.url_id')
    // Then select `urls.id` which is the URL ID, the actual URL, and the `created_at`
    // Count the `visits.id`
    .select(
      'urls.id',
      'urls.url',
      'urls.created_at',
      knex.raw('count(visits.id) as visits_count')
    )
    .limit(limit ?? 15)
    .offset(offset ?? 0)
    // Then group them by the ID
    .groupBy('urls.id')
    .orderBy('urls.created_at', 'desc');

  return results;
};
