const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

module.exports = function () {

    // Home
    router.get('/', homeController.home);

    // Crear y autenticar usuarios
    router.get('/crear-cuenta', usuariosController.fromCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    
    // Ruta para iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    
    // Autenticaciones de usuario
    router.post('/iniciar-sesion', authController.autenticarUsuario);

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

    return router;

}