const Usuarios = require('../models/Usuarios');

exports.fromCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crea tu Cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    const nuevoUsuario = await Usuarios.create(usuario);

    console.log('Usuario Creado: ', nuevoUsuario);

}