const Usuarios = require('../models/Usuarios');
const {body, check, validationResult} = require('express-validator') // MIGRADO A VERSIÓN 6
const enviarEmail = require('../handlers/emails');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: {
        fileSize: 100000
    },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/')
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

exports.fromCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crea tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    await check('confirmar', 'Repetir password no puede estar vacío').notEmpty().run(req); // MIGRADO A VERSIÓN 6
    await check('confirmar', 'Los passwords no coinciden').equals(req.body.password).run(req); // MIGRADO A VERSIÓN 6

    const erroresExpress = validationResult(req).errors; // MIGRADO A VERSIÓN 6

    try {
        
        await Usuarios.create(usuario);

        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar el correo de confirmación de alta de usuario

        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmarCuenta'
        });

        // Redireccionar al login
    
        req.flash('exito', 'Hemos enviado un email de verificación a tu cuenta');
        res.redirect('/iniciar-sesion');
        
    } catch (error) {
        // Errores Sequelize
        const erroresSequelize = error.errors.map(err => err.message);

        // Errores Express Validator
        const errExp = erroresExpress.map(err => err.msg);

        const listaErrores = [...erroresSequelize, ...errExp];


        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

exports.confirmarCuenta = async (req, res, next) => {

    const usuario = await Usuarios.findOne({where : {email: req.params.correo}});
    
    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'La cuenta se ha confirmado correctamente, ya podés iniciar sesión');
    res.redirect('/iniciar-sesion');

}


exports.formIniciarSesion = (req, res) => {
    res.render('iniciarSesion',{
        nombrePagina: 'Iniciar Sesión'
    });
}



// Muestra el formulario para editar el perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editarPerfil',{
        nombrePagina: 'Editar Perfil',
        usuario
    });
}

// Guarda el usuario editado
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // Sanitizar los datos
    body('nombre');
    body('email');

    // Leer los datos del form
    const {nombre, descripcion, email} = req.body;

    // Asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    // Guardar en la DB
    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
}

// Muestra el formulario para modificar el password
exports.formCambiarPassword = async (req, res) => {
    res.render('cambiarPassword', {
        nombrePagina: 'Cambiar Password'
    });
}

// Verifica el password anterior y lo modifica por uno nuevo
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // Verificar que el password actual sea correcto
    if(!usuario.validarPassword(req.body.anterior)){
        req.flash('error', 'El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    // Si el password es correcto, hashear el nuevo 

    const hash = usuario.hashPassword(req.body.nuevo);

    // Asignar el password hasheado al usuario

    usuario.password = hash;

    // Guardar en la DB

    usuario.save();

    // Redireccionar
    req.logout();
    req.flash('exito', 'Contraseña actualizada, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');

}

// Formulario para subir una imagen de perfil
exports.formSubirImagenPerfil = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // mostrar la vista
    res.render('imagenPerfil',{
        nombrePagina: 'Subir Imagen de Perfil',
        usuario
    });
}

// Guarda la imagen nueva, elimina la anterior si corresponde y guarda el registro en la DB
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    console.log(req.file, usuario.imagen);
    // Si hay una imagen anterior eliminarla
    if(req.file && usuario.imagen){

        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
        
        // eliminar el archivo con el filesystem
        fs.unlink(imagenAnteriorPath, (err) => {
            if(err){
                console.log(err);
            }
            return;
        });
    }
    
    // Almacenar la nueva imagen
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    // Guardar en la DB y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');

}