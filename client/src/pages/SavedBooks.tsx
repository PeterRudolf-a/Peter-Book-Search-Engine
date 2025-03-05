import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client'; // Import the useMutation and useQuery hooks from the Apollo Client
import { GET_ME } from '../utils/queries'; // Import the query to fetch user data
import { REMOVE_BOOK } from '../utils/mutations'; // Import the mutation to remove a book
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';

const SavedBooks = () => {
  // Query to fetch user data
  const { data, loading, error } = useQuery(GET_ME);

  // Handle loading state
  if (loading) return <h2>LOADING...</h2>;

  // Handle error state
  if (error) return <h2>Error fetching data</h2>;

  // If data is fetched, store it in userData
  const userData: User = data?.me;

  // useMutation hook for removing a book
  const [removeBookMutation] = useMutation(REMOVE_BOOK);

  // Create function to delete a book
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Use the removeBookMutation function to remove the book
      const response = await removeBookMutation({
        variables: { bookId },
      });

      if (response.data) {
        // Upon success, remove the book's ID from localStorage
        removeBookId(bookId);
      } else {
        throw new Error('Something went wrong while deleting the book.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
