const Grupos = require('../models/Grupos');

// Muestra el formulario para nuevos meetis
exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({where:{usuarioId: req.user.id}});

    res.render('nuevoMeeti', {
        nombrePagina: 'Crear nuevo Meeti',
        grupos
    });
}