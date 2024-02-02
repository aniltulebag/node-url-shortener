import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY!;

export const generateToken = async (
  payload: Record<string, any>
): Promise<string> => {
  return jwt.sign(payload, JWT_PRIVATE_KEY, { expiresIn: '365d' });
};

export const validateJWT = async (
  token: string
): Promise<jwt.JwtPayload & { id: string }> => {
  try {
    const content = jwt.verify(token, JWT_PRIVATE_KEY);

    return content as jwt.JwtPayload & { id: string };
  } catch (error) {
    throw new createHttpError.Unauthorized('Please provide a valid token');
  }
};
