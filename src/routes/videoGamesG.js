const router = require("express").Router();
const Sequelize = require("sequelize");
const { Videogame, Genre, conn } =require('../db');
const { ApiKey } = process.env;
const axios = require('axios');
const { json } = require("body-parser");
const Op = Sequelize.Op;



router.get('/', async (req, res) => {
  const { name } = req.query;

  try {
    if(!name) {// general call

      // search in DB
      let resolveDB = await Videogame.findAll({ attributes: [ 'id', 'name', 'description', 'released', 'rating', 'background_image', 'platforms', 'createdDb' ],
      include: [
        { model: Genre, attributes: ["name"], through: { attributes: [] } }
      ]})
  
      let dbFormat = [];  // here the videogame in DB
  
      if (resolveDB.length){

      resolveDB?.map((e) => {  //sweep every videogame in DB 
        
        let genres = e["genres"];// search the genres
        let formated = [];
        genres.map((e) => formated.push(e["name"]));


        let obj = {  // make object videogame
                id: e.id,
                name: e.name,
                description: e.description,
                released: e.released,
                rating: e.rating,
                background_image: e.background_image,
                genres: formated,
                createdDb: e.createdDb,       
        }

        dbFormat.push(obj);

      })
      }
      

      // search API

      let apiResult = await axios.get(`https://api.rawg.io/api/games?key=${ApiKey}&page=1&page_size=40`);
        promise1 = apiResult;             // launch 3 resquests that will return 40 videogames each

        let urlText = apiResult.data.next;

        apiResult =  await axios.get(`${urlText}`); // the recuests's URL is in the key "next" prev
        promise2 = apiResult;
        
        urlText = apiResult.data.next;

        apiResult =  await axios.get(`${urlText}`);
        promise3 = apiResult;

        await Promise.all([ promise1, promise2, promise3 ]) // wait for results of the 3 requests

        .then((value) => { apiResult = value[0].data.results  // concat the results
          .concat(value[1].data.results)
            .concat(value[2].data.results) });
      
        let resolve = [];

        let resolveGen = [];

        if(apiResult.length){
          apiResult?.map((e) => {  //sweep every  array videogame array

            let genreGroup = [];  // search in genres
              e.genres?.map(e => {
              let gen = e.name
              genreGroup.push(gen)
            })

            let obj = { // make object videogame
              id: e.id,
              name: e.name,
              description: e.description,
              released: e.released,
              rating: e.rating,
              background_image: e.background_image,
              genres: e.genres,
              genres : genreGroup,
              createdDb: false
            }
            
            for (let i = 0; i < genreGroup.length; i++) { // add genres different at array "All Genres"
              let elemento = genreGroup[i]                
              if(!resolveGen.includes(elemento)){
                resolveGen.push(elemento)//20
              }
            }

            resolve.push(obj);

          })

        }
        
        // add genres not yet registred
        resolveGen.map(async (e) => {
          await Genre.findOrCreate({ where: { name: e } });
        })

        let Total = dbFormat.concat(resolve);

        res.status(200).send(Total);

    } else {// call by name
      
      // Search in DB

      if (name.match(/[$%&/()=+-@-,.?¿'¡!"]/)) {  // si tiene caracteres extraños

        return res.status(200).send( // reject the require
          {msg:`No se indicó el parámetro name, o se incluyeron caracteres inválidos`}  // envia msg
          );     
      }

      let resolveDB = await Videogame.findAll({
        where: { name: { [Op.iLike]: `%${name}%` } },
        include: [
          { model: Genre, attributes: ["name"], through: { attributes: [] } },
        ],
      });
  
      let dbFormat = [];  // here the videogames in DB
  
      if (resolveDB.length){

      resolveDB?.map((e) => {  //sweep every videogame in DB 
        
        let genres = e["genres"];// search the genres
        let formated = [];
        genres.map((e) => formated.push(e["name"]));


        let obj = {  // make object videogame
                id: e.id,
                name: e.name,
                description: e.description,
                released: e.released,
                rating: e.rating,
                background_image: e.background_image,
                genres: formated,
                createdDb: e.createdDb,       
        }

        dbFormat.push(obj);

      })
      }


      // search to API
        let apiResult = await axios.get(`https://api.rawg.io/api/games?search=${name}&key=${ApiKey}&page_size=15`);
        apiResult = apiResult.data.results;

        
        
        let resolve = [];   // here the videogames in API

        let resolveGen = [];// save "ALL Genres"

        if(apiResult.length){

          apiResult?.map((e) => {  //sweep every videogame

            let genreGroup = [];  // search the genres
              e.genres?.map(e => {
              let gen = e.name
              genreGroup.push(gen)
            })

            let obj = { // make the object videogame
              id: e.id,
              name: e.name,
              description: e.description,
              released: e.released,
              rating: e.rating,
              background_image: e.background_image,
              genres: e.genres,
              genres : genreGroup,
              createdDb: false
            }
            
            for (let i = 0; i < genreGroup.length; i++) { // add genres different to array "ALL Genres"
              let elemento = genreGroup[i]               
              if(!resolveGen.includes(elemento)){
                resolveGen.push(elemento)//20
              }
            }

            resolve.push(obj);

          })

        }
        
        // add genres not yet registered
        resolveGen.map(async (e) => {
          await Genre.findOrCreate({ where: { name: e } });
        })

        let Total = dbFormat.concat(resolve);

        res.status(200).send(Total);

     }

  } catch (error) {
    console.log('Error en la API', error);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
   
  if (!id || id.match(/[$%&/()=+@ ,.?¿'¡!"]/)) {
    //if (!id) {

        return res.status(200).send(
            {msg:`No se indicó el parámetro id, o se incluyeron caracteres inválidos`}
            );
  }

  try { // Call by ID
  
    console.log(id)
  if (                      // if ID is UUID Format?
    id.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  ) { // ID tiene formato UUID, busca en bd 

      // shearch in DB

      let resolveDB = await Videogame.findOne({
        where: { id: id },
        include: [
          { model: Genre, attributes: ["name"], through: { attributes: [] } },
        ],
      });

      if (resolveDB !== null){ // if found videogame
  
        let formated = [];  // search all genres
        resolveDB.genres.map((e) => formated.push(e["name"]));

        let arrayPlatforms = resolveDB.platforms.split(', ')  // get platforms's array
  

        let obj = {  // crea el objeto videojuego
                id: resolveDB.id,
                name: resolveDB.name,
                description: resolveDB.description,
                released: resolveDB.released,
                rating: resolveDB.rating,
                background_image: resolveDB.background_image,
                //platforms: resolveDB.platforms,
                platforms: arrayPlatforms,
                genres: formated,
                createdDb: resolveDB.createdDb,       
        }

        res.status(200).send(obj);  

      }
      else {
      res.status(400).json({ msg: 'No se encontro el id indicado en DB' });
      }

  }

  else{ // else search in the outer API
      
      const result = await axios.get(`https://api.rawg.io/api/games/${id}?key=${ApiKey}`);
      let apiResult = result.data;

      if(apiResult) {
        
          let arrPlatforms = [] // save platforms

          apiResult.platforms?.map((e) =>{  // search platforms
            arrPlatforms.push(e.platform.name)
          })

          let arrGenres = [] // save genres

          if(apiResult.genres) {  // if have genres...
            apiResult.genres?.map((e) =>{  // read genres
              arrGenres.push(e.name)  // sabe in an array
            })

          }

          const descritionTxt = apiResult.description.replace(/<[^>]+>/g, "").replace(/\n/g, "");

          var obj = {
            id: apiResult.id,
            name: apiResult.name,
            description: descritionTxt,
            released: apiResult.released,
            rating: apiResult.rating,
            background_image: apiResult.background_image,
            platforms: arrPlatforms,
            genres: arrGenres,
            createdDb: false
          }

          res.status(200).send(obj)

        }
        else {
        res.status(400).json({ msg: 'No se encontro el id indicado en API' });
        }

      }  
    
  } catch (error) {
    console.log('Error en la Busqueda por ID', error);
  }
});

module.exports = router;

