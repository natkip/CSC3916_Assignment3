const express = require('express');
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const authJwtController = require('../auth_jwt');
const router = express.Router();

router.route('/')
    .get(authJwtController.isAuthenticated, getMovies)
    .post(authJwtController.isAuthenticated, createMovie);

router.route('/:id')
    .get(authJwtController.isAuthenticated, getMovie)
    .put(authJwtController.isAuthenticated, updateMovie)
    .delete(authJwtController.isAuthenticated, deleteMovie);

module.exports = router;