import User from "../models/User";
import Book from "../models/Book";
import { signToken, AuthenticationError } from "../services/auth";

interface Context {
  user: User;
  book: Book;
  token: string;
}

interface BookInput {
  authors: string[];
  description: string;
  title: string;
  bookId: string;
  image: string;
link: string;
}

interface AuthInput {
    email: string;
    password: string;
}

interface SaveBookInput {
    bookData: BookInput;
}

interface RemoveBookInput {
    bookId: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface AddUserInput {
    username: string;
    email: string;
    password: string;
}

const resolvers = {
    Query: {
        me: async (_: any, __: any, context: Context) => {
        if (context.user) {
            return context.user;
        }
        throw new AuthenticationError("Not logged in");
        },
    },
    Mutation: {
        login: async (_: any, { email, password }: AuthInput) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AuthenticationError("Incorrect credentials");
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
            throw new AuthenticationError("Incorrect credentials");
        }
        const token = signToken(user);
        return { token, user };
        },
        addUser: async (_: any, { username, email, password }: AddUserInput) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AuthenticationError("User already exists");
        }
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
        throw new AuthenticationError("You need to be logged in!");
        },
            return updatedUser;
        }
            const bookExists = context.user.savedBooks.some(book => book.bookId === bookId);
            if (!bookExists) {
                throw new AuthenticationError("Book not found in saved books");
            }
        },
        removeBook: async (_: any, { bookId }: RemoveBookInput, context: Context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError("You need to be logged in!");
        },
    },
}


export default resolvers;