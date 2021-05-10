const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, next) => {
        // Este código se ejecuta al llenar el formulario de inicio de sesión
        const usuario = await Usuarios.findOne({where : {email, activo: 1}});
        
        // Verificar si el usuario existe
        if(!usuario){
            return next(null, false, {
                message: 'Usuario no válido'
            });
        }

        // Verificar si la password es correcta
        const verificaPass = usuario.validarPassword(password);


        // Si el password es incorrecto
        if(!verificaPass){
            return next(null, false,{
                message: 'Password incorrecto'
            });
        }

        return next(null, usuario); 

    }
));

// Configuraciones de serialize de passport
passport.serializeUser(function(usuario, cb){
    cb(null, usuario);
});

passport.deserializeUser(function(usuario, cb){
    cb(null, usuario);
});

module.exports = passport;