import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client'; // Import the ApolloClient, InMemoryCache, and ApolloProvider components from Apollo Client
import { setContext } from '@apollo/client/link/context'; // Import the setContext function from Apollo Client
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

// Create an Apollo Client and set up the connection to the GraphQL API
const httpLink = createHttpLink({
  uri: '/graphql',
});

// Set up the Apollo Client with the connection to the GraphQL API and the ability to send the JWT with each request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
