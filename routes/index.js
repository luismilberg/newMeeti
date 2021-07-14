const express = require('express');
const router = express.Router();


// Controladores Backend
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

// Controladores Frontend
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');

module.exports = function () {

    // Área Pública

    // Home
    router.get('/', homeController.home);

    // Muestra un meeti
    router.get('/meeti/:slug',
        meetiControllerFE.mostrarMeeti
    );

    // Confirma asistencia al Meeti
    router.post('/confirmar-asistencia/:slug', 
        meetiControllerFE.confirmarAsistencia
    );

    // Muestra asistentes al Meeti
    router.get('/asistentes/:slug',
        meetiControllerFE.mostrarAsistentes
    );

    // Muestra perfiles en el Frontend
    router.get('/usuarios/:id',
        usuariosControllerFE.mostrarUsuario
    );

    // Muestra los grupos en el frontend
    router.get('/grupos/:id',
        gruposControllerFE.mostrarGrupo
    );

    // Muestra Meeti's por categoria
    router.get('/categoria/:categoria',
        meetiControllerFE.mostrarCategoria
    );

    // Crear y autenticar usuarios
    router.get('/crear-cuenta', usuariosController.fromCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    
    // Ruta para iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    
    // Autenticaciones de usuario
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Cerrar sesión
    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );




    // Área privada

    // Rutas del panel de Administración
    router.get('/administracion', 
        authController.usuarioAutenticado,
        adminController.panelAdministracion);

    // Rutas para los grupos
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo);
    
    router.post('/nuevo-grupo',
        gruposController.subirImagen,
        gruposController.crearGrupo);

    // Editar grupos
    router.get('/editar-grupo/:id', 
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );
    
    router.post('/editar-grupo/:id',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );
        
    // Editar la imágen del grupo
    router.get('/imagen-grupo/:id',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );

    router.post('/imagen-grupo/:id',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );

    // Eliminar grupos
    router.get('/eliminar-grupo/:id', 
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );

    router.post('/eliminar-grupo/:id', 
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );

    // Nuevos meeti
    router.get('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    );

    router.post('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    );

    // Editar meeti
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti    
    );

    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.editarMeeti
    );


    // Eliminar meeti
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    );

    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    );

    // Editar información de perfil
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    );

    router.post('/editar-perfil', 
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    // Modificar el password
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );

    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    // Imagenes de perfil
    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );

    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    );

    return router;

}