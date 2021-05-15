exports.formNuevoGrupo = (req, res, next) => {
    res.render('nuevoGrupo',{
        nombrePagina: 'Crear un nuevo grupo'
    });
}