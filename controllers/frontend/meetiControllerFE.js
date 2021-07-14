const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const moment = require('moment');
const Sequelize = require('sequelize');

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
            where: {
                slug: req.params.slug
            },
            include: [
                {
                    model: Grupos
                },
                {
                    model: Usuarios,
                    attributes: ['id','nombre','imagen']
                }
            ]
        }  
    );

    // Si no existe
    if(!meeti){
        res.redirect('/')
    }

    // Pasar el resultado a la vista
    res.render('mostrarMeeti',{
        nombrePagina: meeti.titulo,
        meeti,
        moment
    });

}


// Confirma o cancela si el usuario asistirá al meeti
exports.confirmarAsistencia = async (req, res) => {

    const { accion } = req.body;
    if(accion === 'confirmar'){
        // agregar el usuario
        Meeti.update(
            {'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)},
            {'where':{'slug': req.params.slug}}
        );
        res.send('Haz confirmado tu asistencia');
    } else {
        // cancelar la asistencia del usuario
        Meeti.update(
            {'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)},
            {'where':{'slug': req.params.slug}}
        );
        res.send('Haz cancelado tu asistencia');
    }
}

// Muestra el listado de asistentes

exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
        where:{
            slug : req.params.slug
        },
        attributes: ['interesados']
    });

    const { interesados } = meeti;

        const asistentes = await Usuarios.findAll({
            attributes:['nombre','imagen'],
            where: { id : interesados }
        });

    // Crear la vista y pasar los datos
    res.render('asistentesMeeti',{
        nombrePagina: 'Listado de asistentes',
        asistentes
    });
}

// Muestra los Meeti's agrupados por categoria
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        where: { 
            slug : req.params.categoria
        },
        attributes: ['id', 'nombre']
    });

    if(!categoria){
        res.redirect('/');
        return next();
    }

    const meetis = await Meeti.findAll({
        order: [ 
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: {
                    categoriaId : categoria.id
                }
            },
            {
                model: Usuarios
            }
        ]
    })

    res.render('categoria',{
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })

}