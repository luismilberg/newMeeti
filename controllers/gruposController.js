const { body, validationResult } = require('express-validator');
const path = require('path');
const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: {
        fileSize: 100000
    },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/')
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            next(null, true); 
        } else {
            next(new Error('Format no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// Método para subir imágenes al servidor
exports.subirImagen = (req,res, next) => {

    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError){
                req.flash('error', 'El archivo es demasiado grande');
            } else if (errorhasOwnProperty('message')){
                req.flash('error', error.message)
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();  
        }
    });   
}



exports.formNuevoGrupo = async (req, res, next) => {
    const categorias = await Categorias.findAll();
    res.render('nuevoGrupo',{
        nombrePagina: 'Crear un nuevo grupo',
        categorias
    });
}

exports.crearGrupo = async (req,res) => {

    // Sanitizar los campos:
    body('nombre');
    body('url');

    const grupo = req.body;
    
    if(req.file){
        grupo.imagen = req.file.filename;
    }
    
    grupo.usuarioId = req.user.id;

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        console.log(error);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
};

exports.formEditarGrupo = async (req, res) => {

    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.id));
    consultas.push(Categorias.findAll());

    // Promise con await 
    const[grupo, categorias] = await Promise.all(consultas);

    res.render('editarGrupo',{
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
}

// Guardar en la BD los cambios realizados
exports.editarGrupo = async (req, res, next) => {
    // Verificar que el grupo existe y que la persona autenticada es creadora del grupo
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });
    
    // Si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    const { nombre, descripcion, categoriaId, url } = req.body;

    // Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    // Guardamos en la BD
    await grupo.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

}

// Muestra el formulario para editar la imágen de un grupo

exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.id,
            usuarioId: req.user.id
        }
    })
    res.render('imagenGrupo',{
        nombrePagina: `Editar imagen del grupo: ${grupo.nombre}`,
        grupo
    });
}

// Modifica la imagen en la BD y elimina la anterior

exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    // Verificar que el grupo sea válido

    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    // // Verificar que se esté subiendo un archivo nuevo
    // if(req.file){
    //     console.log(req.file.filename);
    // }

    // // Verificar que exista un archivo anterior

    // if(grupo.imagen){
    //     console.log(grupo.imagen);
    // }

    // Si hay imagen anterior y nueva -> Borrar la imagen anterior

    if(req.file && grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/${grupo.imagen}`;
        console.log(imagenAnteriorPath);

        // Eliminar el archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
                return;  
            }
        });
    }

    // Si hay una imagen nueva se guarda
    if(req.file){
        grupo.imagen = req.file.filename;
    }

    // Guardar en la DB
    
    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion'); 

}

// Muestra el formulario para eliminar un grupo

exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where:{
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Ejecutar la vista
    res.render('eliminarGrupo', {
        nombrePagina: `Eliminar grupo ${grupo.nombre}`,
    });

}

// Elimina el grupo e imagen

exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if(!grupo){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Si hay una imagen hay que eliminarla
    if(grupo.imagen){
        const imagenPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenPath, (err) => {
            if(err){
                console.log(err);
                return;
            }
        });
    }

    // Eliminar el grupo
    await Grupos.destroy({
        where: {
            id: req.params.id
        }
    });

    // Redireccionar al usuario
    req.flash('exito', 'Grupo eliminado correctamente');
    res.redirect('/administracion');

}