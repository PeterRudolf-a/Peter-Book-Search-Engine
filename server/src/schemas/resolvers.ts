import User from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js"; // import the signToken function and AuthenticationError class

// Define the context interface
interface Context {
    user: any;
}

// Define the input types for the saveBook and removeBook mutations
interface BookInput {
    authors: string[];
    description: string;
    title: string;
    bookId: string;
    image: string;
    link: string;
}

// Define the input types for the login and saveBook mutations
interface AuthInput {
    email: string;
    password: string;
}

// Define the input types for the saveBook and removeBook mutations
interface SaveBookInput {
    bookData: BookInput;
}

// Define the input types for the removeBook mutation
interface RemoveBookInput {
    bookId: string;
}

// Define the input types for the addUser mutation
interface AddUserInput {
    username: string;
    email: string;
    password: string;
}

// Define the resolvers
const resolvers = {
    Query: {
        // Define the me query
        me: async (_: any, __: any, context: Context) => {
            if (context.user) { // If the user is logged in
                return context.user;
            }
            // If the user is not logged in
            throw new AuthenticationError("Not logged in");
        },
    },
    Mutation: {
        // Define the login mutation
        login: async (_: any, { email, password }: AuthInput) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError("Incorrect credentials");
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError("Incorrect credentials");
            }
            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        },
        // Define the addUser mutation
        addUser: async (_: any, { username, email, password }: AddUserInput) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) { // If the user already exists
                throw new AuthenticationError("User already exists");
            }
            const newUser = await User.create({ username, email, password });
            const token = signToken(newUser.username, newUser.password, newUser._id);
            return { token, user: newUser };
        },
        // Define the saveBook mutation
        saveBook: async (_: any, { bookData }: SaveBookInput, context: Context) => {
            if (context.user) {
                // Validate bookData
                if (!bookData.title || !bookData.bookId || !bookData.authors || !bookData.description) {
                    throw new Error("Invalid book data");
                }
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true }
                );
                return updatedUser;
            }
            // If the user is not logged in
            throw new AuthenticationError("You need to be logged in!");
        },
        // Define the removeBook mutation
        removeBook: async (_: any, { bookId }: RemoveBookInput, context: Context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            // If the user is not logged in
            throw new AuthenticationError("You need to be logged in!");
        },
    },
};

export default resolvers;