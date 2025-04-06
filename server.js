require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies'); // You're not using Movie, consider removing it
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const router = express.Router();

// Removed getJSONObjectForMovieRequirement as it's not used

router.post('/signup', async (req, res) => { // Use async/await
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' }); // 400 Bad Request
  }

  try {
    const user = new User({ // Create user directly with the data
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save(); // Use await with user.save()

    res.status(201).json({ success: true, msg: 'Successfully created new user.' }); // 201 Created
  } catch (err) {
    if (err.code === 11000) { // Strict equality check (===)
      return res.status(409).json({ success: false, message: 'A user with that username already exists.' }); // 409 Conflict
    } else {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
    }
  }
});


router.post('/signin', async (req, res) => { // Use async/await
  try {
    const user = await User.findOne({ username: req.body.username }).select('name username password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(req.body.password); // Use await

    if (isMatch) {
      const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
  }
});

//POST: Creates a new movie
router.post('/movies', authJwtController.isAuthenticated, async (req, res) => {
  const { title, releaseDate, genre, actors } = req.body;
  if (!title || !releaseDate || !genre || !actors {
    return res.status(400).json({ success: false, msg: 'Missing movie information.' });
  }
  try {
    const movie = new Movie({ title, releaseDate, genre, actors });
    await movie.save();
    res.status(201).json({ success: true, msg: 'Movie created successfully. '});
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error creating movie.' });
  }
});

//GET: Retrieves all movies
router.get('/movies', authJwtController.isAuthenticated, async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json({ success: true, movies });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error fetching movies.' });
  }
});

//GET: Retrieve a specific movie by title
router.get('/movies/:title', authJwtController.isAuthenticated, async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.parans.title });
    if (!movie) return res.status(404).json({ success: false, msg: 'Movie not found.' });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error retrieving movie.' });
  }
});

//PUT: Update a specific movie by title
router.put('/movies/:title', authJwtController.isAuthenticated, async (req, res) => {
  try {
    const updatedMovie = await Movie.findOneAndUpdate({ title: req.params.title }, req.body, { new: true });
    if ( !updatedMovie) return res.status(404).json({ success: false, msg: 'Movie not found. '});
    res.json({ success: true, msg: 'Movie updated successfully.', updatedMovie });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error updating movie.' });
  }
});

//DELETE: Deletes a specific movie by title
router.delete('/movies/:title', authJwtController.isAuthenticated, async (req, res) => {
  try {
    const deletedMovie = await Movie.findOneAndDelete({ title: req.params.title });
    if (!deletedMovie) return res.status(404).json({ success: false, msg: 'Movie not found. '});
    res.json({ success: true, msg: 'Movie deleted successfully. '});
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Error deleting movie.' });
  }
});

//Registers the router 
app.use('/', router);

const PORT = process.env.PORT || 5000; // Define PORT before using it
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing only