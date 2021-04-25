const express = require('express');
require('dotenv').config({path: 'variables.env'});
const router = require('./routes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');


const app = express();



// Template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, './views'));

// Archivos estáticos
app.use(express.static('public'));

// Middleware propio
app.use((req, res, next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();
});

// Inicializa las rutas
app.use('/', router());

// Puerto
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo');
});