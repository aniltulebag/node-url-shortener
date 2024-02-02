import createHttpError from 'http-errors';
import type { Visit } from '../types';

import knex from '../config/knex';

export const registerVisit = async (
  urlId: string,
  ip: string
): Promise<void> => {
  await knex('visits').insert({
    url_id: urlId,
    ip,
  });
};

export const getLastVisits = async (
  userId: number,
  limit: number,
  offset: number
): Promise<any[]> => {
  return await knex('visits')
    .join('urls', 'urls.id', 'visits.url_id')
    .select('urls.id', 'urls.url', 'visits.ip', 'visits.created_at')
    .where({
      user_id: userId,
    })
    .limit(limit ?? 15)
    .offset(offset ?? 0)
    .orderBy('visits.created_at', 'desc');
};

export const getVisitsByURL = async (
  urlId: string,
  userId: number,
  limit: number,
  offset: number
): Promise<Visit[]> => {
  const url = await knex('urls').where({ id: urlId }).select('user_id').first();

  if (url === undefined) {
    throw new createHttpError.NotFound('URL is not found');
  }

  if (url.user_id !== userId) {
    throw new createHttpError.Unauthorized(
      "You don't have permissions to view this URL"
    );
  }

  return await knex('visits')
    .where({ url_id: urlId })
    .limit(limit ?? 15)
    .offset(offset ?? 0)
    .orderBy('created_at', 'desc');
};
