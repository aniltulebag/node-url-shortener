import createHttpError from 'http-errors';
import type { User } from '../types';

import { validateLogin, validateRegister } from './validations';
import knex from '../config/knex';
import { comparePassword, hashPassword } from '../config/encyription';
import { generateToken } from '../config/jwt';

const getUser = async (username: string): Promise<User | undefined> => {
  return await knex('users')
    .whereRaw('LOWER(username) = LOWER(?)', [username])
    .first();
};

export interface RegisterBody {
  username: string;
  password: string;
}

export const register = async (
  body: RegisterBody
): Promise<Pick<User, 'id' | 'username'>> => {
  validateRegister(body);

  const user = await getUser(body.username);

  if (!(user === undefined)) {
    throw new createHttpError.Conflict('Username already exists');
  }

  const newUser = (
    await knex('users').insert(
      {
        username: body.username.toLowerCase(),
        password: await hashPassword(body.password),
      },
      ['id', 'username']
    )
  )[0];

  return newUser;
};

export interface LoginBody {
  username: string;
  password: string;
}

export const login = async (
  body: LoginBody
): Promise<{
  user: Omit<User, 'password'>;
  token: string;
}> => {
  validateLogin(body);

  const user = await getUser(body.username);

  if (user === undefined) {
    throw new createHttpError.Unauthorized(
      'Username or password are incorrect'
    );
  }

  const passwordMatch = await comparePassword(body.password, user.password);

  if (!passwordMatch) {
    throw new createHttpError.Unauthorized(
      'Username or password are incorrect'
    );
  }

  const token = await generateToken({ id: user.id });

  return {
    user: {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token,
  };
};
