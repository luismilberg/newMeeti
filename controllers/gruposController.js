const { body, validationResult } = require('express-validator');
const shortid = require('shortid');
const multer = require('multer');
const path = require('path');
const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');




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