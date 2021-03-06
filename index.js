const express = require('express');
const router = require('./routes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');


// Habilitar las variables de entorno
require('dotenv').config({path: 'variables.env'});

// Conexión a la db
const db = require('./config/db');
    // Requerir los modelos
    require('./models/Usuarios');
    require('./models/Categorias');
    require('./models/Grupos');
    require('./models/Meeti');
    require('./models/Comentarios');
    db.sync().then(() => console.log('DB Conectada')).catch((err) => console.log(err));




// Aplicación principal
const app = express();


// Configuración del body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


// Template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, './views'));

// Archivos estáticos
app.use(express.static('public'));

// Cookie Parser
app.use(cookieParser());

// Sesiones 
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());


// Middleware propio
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
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