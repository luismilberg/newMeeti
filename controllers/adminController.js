 const Grupos = require('../models/Grupos')

exports.panelAdministracion = async (req, res) => {
    const grupos = await Grupos.findAll({whre: {usuarioId : req.user.id}});
    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        grupos
    });
}