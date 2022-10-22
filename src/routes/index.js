const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const videoGamesG = require('./videoGamesG');
const genresG = require('./genresG');
const gameVideoP = require('./gameVideoP');
const genresA = require('./genresA');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use('/games', videoGamesG);
router.use('/genres', genresG);
router.use('/game', gameVideoP);
router.use('/genresApi', genresA);

module.exports = router;
