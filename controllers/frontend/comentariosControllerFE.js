const Comentarios = require("../../models/Comentarios");
const Meeti = require("../../models/Meeti");

exports.agregarComentario = async (req, res, next) => {
  // Obtener el comentario
  const { comentario } = req.body;

  // Crear el comentario en la BD
  await Comentarios.create({
    mensaje: comentario,
    usuarioId: req.user.id,
    meetiId: req.params.id,
  });

  // Redireccionar el usuario a la misma página
  res.redirect("back");
  next();
};

exports.eliminarComentario = async (req, res, next) => {
  // Tomar el ID del comentario
  const { comentarioId } = req.body;

  // Consultar el comentario
  const comentario = await Comentarios.findOne({ where: { id: comentarioId } });

  // Verificar si existe el comentario
  if (!comentario) {
    res.status(404).send("Acción no válida");
    return next();
  }

  // Consultar el Meeti al que pertenece el comentario
  const meeti = await Meeti.findOne({ where: { id: comentario.meetiId } });

  // Verificar que quien lo borra sea el creador
  if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
    await Comentarios.destroy({
      where: {
        id: comentario.id,
      },
    });
    res.status(200).send("Eliminado Correctamente");
    return next();
  } else {
    res.status(403).send("Acción no válida");
    return next();
  }
};
