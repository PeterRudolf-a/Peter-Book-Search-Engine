import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql'; // Import the GraphQLError class
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Verify the JWT token
export const authenticateToken = async (req: Request): Promise<JwtPayload | null> => {
  const authHeader = req.headers.authorization; // Get the authorization header

  // If the token is missing, throw an error
  if (!authHeader) {
    throw new AuthenticationError('Authorization token missing');
  }

  // Split the token to get the actual token
  const token = authHeader.split(' ')[1];

  // If the token is missing, throw an error
  if (!token) {
    throw new AuthenticationError('Authorization token malformed');
  }

  const secretKey = process.env.JWT_SECRET_KEY || '';

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    return decoded;  // Return the user from the decoded token
  } catch (err) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

// Sign a new JWT token
export const signToken = (username: string, email: string, _id: unknown): string => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Custom error class for authentication errors that extends the GraphQLError class
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}
