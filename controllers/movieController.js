const Movie = require('../Movies.js');

//Get all movies
exports.getMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json({ success: true, data: movies});
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//Gets movie by ID
exports.getMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return resource.status(404).json({ success: false, message: 'Movie not found '});
        res.status(200).json({ success: true, data: movie });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message});
    }
};

// Create a new movie
exports.createMovie = async (req, res) => {
    try {
        const { title, director, releaseYear, genre } = req.body;
        const newMovie = new Movie({ title, director, releaseYear, genre });
        await newMovie.save();
        res.status(201).json({ success: true, data: newMovie });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

//Update a movie
exports.updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMovie) return res.status(404).json({ success: false, message: 'Movie not found '});
        res.status(200).json({ success: true, data: updatedMovie });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

//Delete a movie
exports.deleteMovie = async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) return res.status(404).json({ success: false, message: 'Movie not found '});
        res.status(200).json({ success: true, message: 'Movie deleted '});
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};