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
    if(!name) {// LLAMADA GENERAL

      // BUSQUEDA EN DB
      let resolveDB = await Videogame.findAll({ attributes: [ 'id', 'name', 'description', 'released', 'rating', 'background_image', 'platforms', 'createdDB' ],
      include: [
        { model: Genre, attributes: ["name"], through: { attributes: [] } }
      ]})
  
      let dbFormat = [];  // Aqui los video juegos en DB
  
      if (resolveDB.length){

      resolveDB?.map((e) => {  //Barre cada videojuego en DB 
        
        let genres = e["genres"];// Buscamos los generos
        let formated = [];
        genres.map((e) => formated.push(e["name"]));


        let obj = {  // crea el objeto videojuego
                id: e.id,
                name: e.name,
                description: e.description,
                released: e.released,
                rating: e.rating,
                background_image: e.background_image,
                genres: formated,
                createdDB: e.createdDB,       
        }

        dbFormat.push(obj);

      })
      }
      

      // BUSQUEDA API

      let apiResult = await axios.get(`https://api.rawg.io/api/games?key=${ApiKey}&page=1&page_size=50`);
        promise1 = apiResult;

        let urlText = apiResult.data.next;

        apiResult =  await axios.get(`${urlText}`);
        promise2 = apiResult;
        
        urlText = apiResult.data.next;

        apiResult =  await axios.get(`${urlText}`);
        promise3 = apiResult;

        await Promise.all([ promise1, promise2, promise3 ])

        .then((value) => { apiResult = value[0].data.results
          .concat(value[1].data.results)
            .concat(value[2].data.results) });
      
        let resolve = [];   // Aqui los video juegos en DB

        let resolveGen = [];// Aqui guardamos "Todos los Géneros"

        if(apiResult.length){

          //console.log("Cantidad de videoguegos= ", apiResult.length) // <---- ver esto "solo envia 40"

          apiResult?.map((e) => {  //Barre cada videojuego

            let genreGroup = [];  // Buscamos los generos
              e.genres?.map(e => {
              let gen = e.name
              genreGroup.push(gen)
            })

            let obj = { // crea el objeto videojuego
              id: e.id,
              name: e.name,
              description: e.description,
              released: e.released,
              rating: e.rating,
              background_image: e.background_image,
              genres: e.genres,
              genres : genreGroup,
              createdDB: false
            }
            
            for (let i = 0; i < genreGroup.length; i++) { // agrega generos distintos al array
              let elemento = genreGroup[i]                // de "Todos los Géneros"
              if(!resolveGen.includes(elemento)){
                resolveGen.push(elemento)//20
              }
            }

            resolve.push(obj);

          })

          // console.log(resolveGen)
        }
        
        // Agrega Dietas aun no registradas
        resolveGen.map(async (e) => {
          await Genre.findOrCreate({ where: { name: e } });
        })

        let Total = dbFormat.concat(resolve);

        res.status(200).send(Total);

    } else {// LLAMADA POR NOMBRE
      
      // BUSQUEDA EN DB

      let resolveDB = await Videogame.findAll({
        where: { name: { [Op.like]: `%${name}%` } },
        include: [
          { model: Genre, attributes: ["name"], through: { attributes: [] } },
        ],
      });
  
      let dbFormat = [];  // Aqui los video juegos en DB
  
      if (resolveDB.length){

      resolveDB?.map((e) => {  //Barre cada videojuego en DB 
        
        let genres = e["genres"];// Buscamos los generos
        let formated = [];
        genres.map((e) => formated.push(e["name"]));


        let obj = {  // crea el objeto videojuego
                id: e.id,
                name: e.name,
                description: e.description,
                released: e.released,
                rating: e.rating,
                background_image: e.background_image,
                genres: formated,
                createdDB: e.createdDB,       
        }

        dbFormat.push(obj);

      })
      }


      // BUSQUEDA API
        let apiResult = await axios.get(`https://api.rawg.io/api/games?search=${name}&key=${ApiKey}&page_size=15`);
        apiResult = apiResult.data.results;

        
        
        let resolve = [];   // Aqui los video juegos en DB

        let resolveGen = [];// Aqui guardamos "Todos los Géneros"

        if(apiResult.length){

          apiResult?.map((e) => {  //Barre cada videojuego

            let genreGroup = [];  // Buscamos los generos
              e.genres?.map(e => {
              let gen = e.name
              genreGroup.push(gen)
            })

            let obj = { // crea el objeto videojuego
              id: e.id,
              name: e.name,
              description: e.description,
              released: e.released,
              rating: e.rating,
              background_image: e.background_image,
              genres: e.genres,
              genres : genreGroup,
              createdDB: false
            }
            
            for (let i = 0; i < genreGroup.length; i++) { // agrega generos distintos al array
              let elemento = genreGroup[i]                // de "Todos los Géneros"
              if(!resolveGen.includes(elemento)){
                resolveGen.push(elemento)//20
              }
            }

            resolve.push(obj);

          })

          // console.log(resolveGen)
        }
        
        // Agrega Dietas aun no registradas
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
  try { // LLAMADA POR ID
  
    console.log(id)
  if (                      //Las Recetas en BD tiene ID en formato UUIDV4??...
    id.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  ) { // ID tiene formato UUID, busca en bd 

    // console.log(id);
    // res.status(200).send({msg : "detecto UUID"});

      // BUSQUEDA EN DB

      let resolveDB = await Videogame.findOne({
        where: { id: id },
        include: [
          { model: Genre, attributes: ["name"], through: { attributes: [] } },
        ],
      });

      if (resolveDB !== null){ // Si se encontró el videojuego
  
        let formated = [];  // Buscamos los generos
        resolveDB.genres.map((e) => formated.push(e["name"]));
  

        let obj = {  // crea el objeto videojuego
                id: resolveDB.id,
                name: resolveDB.name,
                description: resolveDB.description,
                released: resolveDB.released,
                rating: resolveDB.rating,
                background_image: resolveDB.background_image,
                platforms: resolveDB.platforms,
                genres: formated,
                createdDB: resolveDB.createdDB,       
        }

        res.status(200).send(obj);  

      }
      else {
      res.status(400).json({ msg: 'No se encontro el id indicado en DB' });
      }

  }

  else{ // sino busca en la API externa
      
      const result = await axios.get(`https://api.rawg.io/api/games/${id}?key=${ApiKey}`);
      let apiResult = result.data;

      if(apiResult) {
        
          let arrPlatforms = [] // guardo plataformas

          apiResult.platforms?.map((e) =>{  // busco las plataformas
            arrPlatforms.push(e.platform.name)
          })

          let arrGenres = [] // guardo generos

          if(apiResult.genres) {  // si hay generos...
            apiResult.genres?.map((e) =>{  // busco las generos
              arrGenres.push(e.name)  // los guardo en un array
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
            genres: arrGenres
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

