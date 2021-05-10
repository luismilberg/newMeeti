const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

// Transport para loguearse en el servicio de mails

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth:{
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Método para envío de mails

exports.enviarEmail = async (opciones) => {
    console.log(opciones); // sólo para verificar las opciones por consola

    // Leer el archivo para el mail (fs)
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    // Compilar el archivo para enviar el mail
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));

    // Crear el html
    const html = compilado({
        url: opciones.url
    });

    // Configurar las opciones del mail
    const opcionesEmail = {
        from: 'Meeti <noreplay@meeti.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        html
    }


    // Enviar el mail
    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);

}
