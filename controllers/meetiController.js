const { body, validationResult } = require('express-validator');
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

// Muestra el formulario para nuevos meetis
exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({where:{usuarioId: req.user.id}});

    res.render('nuevoMeeti', {
        nombrePagina: 'Crear nuevo Meeti',
        grupos
    });
}

// Inserta un nuevo Meeti en la BD

exports.crearMeeti = async (req, res) => {
    // obtener los datos
    const meeti = req.body;
    
    // asignar el usuario
    meeti.usuarioId = req.user.id;

    // almacenar la ubicación con un point
    const point = {
        type: 'Point',
        coordinates: [
            parseFloat(req.body.lat),
            parseFloat(req.body.lng)
        ]
    }
    meeti.ubicacion = point;

    // cupo opcional
    if(req.body.cupo === ''){
        meeti.cupo = 0;
    }

    // almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Meeti creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }

}

// Sanitizar los campos

exports.sanitizarMeeti = (req, res, next) => {

    body('titulo');
    body('invitado');
    body('cupo');
    body('fecha');
    body('hora');
    body('direccion');
    body('ciudad');
    body('estado');
    body('pais');
    body('lat');
    body('lng');
    body('grupoId');

    next();
}