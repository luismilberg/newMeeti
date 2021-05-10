const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

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


    return router;

}