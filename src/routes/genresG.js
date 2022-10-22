const router = require("express").Router();
const Sequelize = require("sequelize");
const { Genre } = require('../db');
const Op = Sequelize.Op;

router.get('/', async (req, res) => {
    try {
        let dbResult = await Genre.findAll({ attributes: ['id', 'name'] });
        res.json(dbResult);
    } catch (error) {
        console.log('Error en los Generos', error);
        res.status(400).json({ msg: 'Error en lectura delos generos de Base de Datos' })
    }
})

module.exports = router;