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
export const authenticateToken = ({ req }: { req: Request }) => {
  // allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }
  if (!token) {
    return req;
  }
  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
    req.user = data as JwtPayload;
  } catch (err) {
    console.log('Invalid token');
  }
  return req;
};

// Sign a new JWT token
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY;
  return jwt.sign({data: payload}, secretKey, { expiresIn: '2h' });
};

// Custom error class for authentication errors that extends the GraphQLError class
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};

/*export const createApolloContext = async ({ req }: { req: Request }) => {
  try {
   const authHeader = req?.headers?.authorization; // Get the authorization header

   if (!authHeader) {
     return {};
   }
  }
};*/