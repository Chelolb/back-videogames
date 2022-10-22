
const router = require("express").Router();
const Sequelize = require("sequelize");
const { Videogame, Genre, conn } =require('../db');
const { ApiKey } = process.env;
const axios = require('axios');
const { json } = require("body-parser");
const Op = Sequelize.Op;


//Populate Genres table with Api genres 
router.get('/', async (req, res) => {
  const result = await axios.get(`https://api.rawg.io/api/genres?key=${ApiKey}`)
//   genresVarios = apigenres.data.results.map(p => p.name)
    let apiResult = result.data.results;
    let genVarios = [];
    if(apiResult.length){
        apiResult.map((e) => {
        //   var obj = {
            // name: 
            genVarios.push(e.name);
        //   }
        })
    };

console.log(genVarios)
res.status(200).json(genVarios)
});

// popgenres();
module.exports = router;