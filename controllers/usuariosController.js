const Usuarios = require('../models/Usuarios');
const {check, validationResult} = require('express-validator') // MIGRADO A VERSIÓN 6
const enviarEmail = require('../handlers/emails');

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

