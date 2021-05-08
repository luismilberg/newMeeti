const Usuarios = require('../models/Usuarios');

exports.fromCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crea tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    try {
        const nuevoUsuario = await Usuarios.create(usuario);
    
        console.log('Usuario Creado: ', nuevoUsuario);
        
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/crear-cuenta');
    }


}