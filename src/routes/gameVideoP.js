const router = require("express").Router();
const Sequelize = require("sequelize");
const { Videogame, Genre } = require('../db')
const Op = Sequelize.Op;

router.post('/', async (req, res) => {
    try {
        let { name, description, released, rating, background_image, platforms, genres } = req.body;
        let newVideoGame = await Videogame.create({
            name,
            description,
            released,
            rating,
            background_image,
            platforms
        })

        let formated = Array.isArray(genres) ? genres: [genres];

        const matchingGenres = await Genre.findAll({
            where: {
                name: {
                    [Op.in] : formated
                }
            }
        })

        await newVideoGame.setGenres(matchingGenres)

        res.status(201).json(newVideoGame)

    } catch (error) {
        console.log('ERROR haciendo POST de videojuego', error)
        res.status(400).json({msg: 'Error en registro de videojuego en Base de Datos'})
    }
})

module.exports = router;