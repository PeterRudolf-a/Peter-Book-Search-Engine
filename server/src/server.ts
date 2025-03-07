import express from "express";
import { Request, Response } from "express";
import { ApolloServer } from "@apollo/server"; // Import ApolloServer
import { expressMiddleware } from "@apollo/server/express4"; // Import expressMiddleware
import path from "node:path";
import { typeDefs, resolvers } from "./schemas/index.js"; // Import typeDefs and resolvers
import db from "./config/connection.js";
import routes from "./routes/index.js";
import "dotenv/config";
import { authenticateToken } from "./services/auth.js"; // Import authenticateToken

const app = express();
const PORT = process.env.PORT || 3001;

interface Context {
  user?: string;
  book?: string;
  token?: string;
}

// Create a new ApolloServer instance and pass in the type
// definitions and resolvers from the schemas folder
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

// Function to start the ApolloServer
const startApolloServer = async () => {
  await server.start(); // Start the ApolloServer
  await db(); // Connect to the database

  console.log("Apollo Server started successfully");

  app.use(express.urlencoded({ extended: true }));

  // Use the expressMiddleware function to connect ApolloServer to Express
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authenticateToken as any
    }
  ));

  app.use(routes);

  // Serve up static assets in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Ensure the database connection is established before starting the server
  /*db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });

  // Handle database connection errors
  db.on("error", (err) => {
    console.error("Database connection error:", err);
  });*/

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

// Start the Apollo Server
startApolloServer();