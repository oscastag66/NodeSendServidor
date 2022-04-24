const Enlaces = require('../models/Enlace'); 
const shortid = require('shortid');
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async (req, res, next) => {
    // Revisar si hay errroes
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json(({errores: errores.array()}))
    }
    //console.log(req.body);
    // Crear un objeto de enlace
    const { nombre_original, nombre } = req.body;
    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;
    
    if(req.usuario) {
        console.log(req.usuario)
        const { password, descargas} = req.body;
        // SDIGNSR EL numero de descargas 
        if(descargas) {
            enlace.descargas = descargas;
        }
        // asignar el password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
            
        }
        // asignar el autor
        enlace.autor = req.usuario.id;

    }
    
    //console.log(enlace)

 
    // Almacenar en la BD
    try {
        await enlace.save();
        return res.json({ msg: `${enlace.url}`});
        next();
    } catch (error) {
        console.log(error)
    }
}
// Obtener todos los enlaces
exports.todosEnlaces =  async (req, res) => {
    try {
        const enlaces = await Enlaces.find({}).select('url -_id');
        res.json({enlaces});
    } catch (error) {
        console.log(error)
    
    }
}
// Retorna si el enlace tiene password
exports.tienePassword = async (req, res, next) => {
    const { url } = req.params;
    //console.log(url);
    // verificar si existe el enlace
    const enlace = await Enlaces.findOne({url: req.params.url});
    if (!enlace) {
        res.status(404).json({ msg: 'Este enlace no existe'});
        return next();
    }
    if (enlace.password) {
        return res.json({password: true, enlace: enlace.url})
    } 
    next();
}

// Verifica si el password es correcto
exports.verificarPassword = async (req, res, next) => {
    const { url } = req.params;
    // Conultar por el enlace
    const enlace = await Enlaces.findOne({url});
    const { password } = req.body;
    // Verificar el password
    if(bcrypt.compareSync( password, enlace.password)) {
       // permitir descargar el arhivo al usuario 
       next();
    } else {
        return res.status(401).json({ msg: 'Password incorrecto!'})
    }
    

    console.log(req.body);
}
// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
    const { url } = req.params;
    //console.log(url);
    // verificar si existe el enlace
    const enlace = await Enlaces.findOne({url: req.params.url});
    if (!enlace) {
        res.status(404).json({ msg: 'Este enlace no existe'});
        return next();
    }
    // si el enlace existe se envia
    //res.json({archivo: enlace.nombre})
    res.json({archivo: enlace.nombre, password: false})
    
    next();

    
}