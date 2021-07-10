const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion', 
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Verifica si el usuario está autenticado
exports.usuarioAutenticado = (req, res, next) => {
    // Si está autenticado
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/iniciar-sesion');
}

exports.cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('correcto', 'Cerraste sesión correctamente');
    res.redirect('/iniciar-sesion');
    next();
}