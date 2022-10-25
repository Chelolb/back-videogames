const router = require("express").Router();
const Sequelize = require("sequelize");
const { Videogame, Genre } = require('../db')
const Op = Sequelize.Op;

router.post('/', async (req, res) => {
    try {
        let { name, description, released, rating, background_image, platforms, genres } = req.body;

        let msgErrors = null    // validación de los datos enviados

        let isDate = (released.match(/^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})$/)); // valida fecha

        if (!name || name.match(/[$%&/()=+-@=,.?¿'¡!"]/)) msgErrors = 'name no es válido';
        else if (!description || description === '') msgErrors = 'debe indicar una description válida' 
        else if (!isDate) msgErrors = 'debe indicar una fecha válida en released';
        else if (rating < 1 || rating > 100 || isNaN(rating)) msgErrors = 'rating no tiene el valor esperado';
        else if (!background_image || background_image === '')  msgErrors = 'No se indicó image correctamente';
        else if (!platforms || platforms === '') msgErrors = 'debe indicar un platforms válida';
        else if (!Array.isArray(genres) || genres.length < 1) msgErrors = 'genres no es un array o está vacío';
    
        if (msgErrors) {        // si hay error, no guarda envía msg
            return res.status(200).send(
                {msg:`${msgErrors}, No se guardó el videojuego`}
                );
        }

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

        let obj = { name, description, released, rating, background_image, platforms, genres, result:"OK" }
        res.status(201).json(obj)

    } catch (error) {
        console.log('ERROR haciendo POST de videojuego', error)
        res.status(400).json({msg: 'Error en registro de videojuego en Base de Datos'})
    }
})

module.exports = router;