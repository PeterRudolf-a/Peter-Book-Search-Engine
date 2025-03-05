import express from "express";
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

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Use the expressMiddleware function to connect ApolloServer to Express
  app.use(`/graphql`, expressMiddleware(server, {
    context: async ({ req }) => {
      // Get the user from the request
      const user = await authenticateToken(req); 
      return { user };
    },
  }));

  // Serve up static assets in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.use(routes);

  // Ensure the database connection is established before starting the server
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Start the Apollo Server
startApolloServer();