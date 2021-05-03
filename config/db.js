const Sequelize = require('sequelize');

module.exports = new Sequelize('meeti','meeti','1112',{
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    // loggin: false //descomentar para ocultar el loggin de la BD por consola

    //para deshabilitar los timeStamps hay que descomentar la siguiente propiedad
    // define: {
    //     timeStamps: false
    // }
});