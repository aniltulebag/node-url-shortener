import createHttpError from 'http-errors';
import Validator from 'validatorjs';

type RequestBody = Record<string, any>;

const validateRequestBody = (
  body: RequestBody,
  validationSchema: Validator.Rules
): boolean => {
  const validation = new Validator(body, validationSchema);

  if (validation.fails() === true) {
    const errors = validation.errors.all();
    const aggregatedErrors: string[] = [];

    Object.keys(errors).forEach((key) => {
      aggregatedErrors.push(validation.errors.first(key) as string);
    });

    throw new createHttpError.BadRequest(aggregatedErrors.join(' , '));
  } else {
    return true;
  }
};

export const validateCreateShortURL = (body: RequestBody): boolean =>
  validateRequestBody(body, {
    url: 'url|required',
    id: 'string|min:5|max:10|not_in:auth,urls,visits',
  });

export const validateUpdateShortURL = (body: RequestBody): boolean =>
  validateRequestBody(body, { url: 'url|required' });

export const validateRegister = (body: RequestBody): boolean =>
  validateRequestBody(body, {
    username: 'string|required|min:4|max:8',
    password: 'string|required|min:6',
  });

export const validateLogin = (body: RequestBody): boolean =>
  validateRequestBody(body, {
    username: 'string|required',
    password: 'string|required',
  });
