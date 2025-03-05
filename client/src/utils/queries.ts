import { gql } from '@apollo/client'; // import gql from Apollo Client

// Define the query to fetch user data
export const GET_ME = gql`
  query me {
    me {
      _id
      name
      skills
    }
  }
`;
