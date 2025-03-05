const typeDefs = `
    # query type for the current user
    type Query {
        me: User
    }

    # type for the user
    type User {
        _id: ID
        username: String
        email: String
        bookCount: Int
        savedBooks: [Book]
    }

    # input type for the book
    input BookInput {
        authors: [String]
        description: String
        title: String
        bookId: String
        image: String
        link: String
    }

    # type for the book
    type Book {
        bookId: ID
        authors: [String]
        description: String
        title: String
        image: String
        link: String
    }

    # type for the authentication token
    type Auth {
        token: ID!
        user: User
    }

    # mutation type for the login and add user
    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveBook(bookData: BookInput!): User
        removeBook(bookId: ID!): User
    }
`;


export default typeDefs;
