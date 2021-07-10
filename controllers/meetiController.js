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

// Muestra el formulario para editar los meetis
exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({where:{usuarioId: req.user.id}}));
    consultas.push(Meeti.findByPk(req.params.id));
    
    // Retornar un promise
    const [grupos, meeti] = await Promise.all(consultas);
    if(!grupos || !meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editarMeeti',{
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        meeti,
        grupos
    });

}

// Almacena los cambios en el meeti
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({where:{id: req.params.id, usuarioId: req.user.id}});
    
    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Asignar los valores
    const { grupoid, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng} = req.body;

    meeti.grupoid = grupoid;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    // Asignar point (ubicación)
    const point = {type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    // Almacenar en la base de datos

    await meeti.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

}

// Formulario para eliminar el meeti
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({where:{id: req.params.id, usuarioId: req.user.id}});

    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminarMeeti',{
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    });

}

// Elimina el meeti de la BD
exports.eliminarMeeti = async (req, res) => {

    const meeti = await Meeti.destroy({
        where:{
            id: req.params.id, 
            usuarioId: req.user.id
        }
    });

    req.flash('exito', 'Meeti eliminado');
    res.redirect('/administracion');
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