exports.panelAdministracion = (req, res) => {
    res.render('administracion', {
        nombrePagina: 'Panel de administración'
    });
}