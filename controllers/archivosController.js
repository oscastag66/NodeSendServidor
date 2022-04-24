const req = require('express/lib/request');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs')
const Enlaces = require('../models/Enlace') 

const configuracionMulter = {
    limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'/../uploads')
        },
        filename: (req, file, cb) => {
            //const extension = file.mimetype.split('/')[1];
            const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
            cb(null, `${shortid.generate()}.${extension}`)
        },
        fileFilter: (req, file, cb) => {
            if(file.mimetype === "application/zip") {
                return cb(null, true);
            } 
        }
    })
}

const upload = multer(configuracionMulter).single('archivo');

exports.subirArchivo = async (req, res, next) => {


    //console.log(req.file);
    upload(req, res, async (error) => {
        //
        if (!error) {
            res.json({ archivo: req.file.filename });
        } else {
            console.log(error);
            return next();
        }
    });
};

exports.eliminarArchivo = async (req, res) => {
    //console.log(req.archivo)
    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
        //console.log('Archivo Eliminado')
    } catch (error) {
        console.log(error)
    }
};

// descargar archivos
exports.descargar = async (req, res, next) => {
    const { archivo } = req.params;
    const enlace = await Enlaces.findOne({ nombre: archivo });
    //console.log(enlace)
    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);
    // elimiar el archivo y la entrada de la BD
    if (enlace) {
        const { descargas, nombre } = enlace;

        if (descargas === 1) {
            // eliminar el archivo
            req.archivo = nombre;
            //console.log(req.params.url)
            await Enlaces.findOneAndRemove(enlace.id);
            next();
            // elimnar la entrada en la bd
    
        } else {
            // si las descargas son =1 - restar 1 a descargas y borrar archivo
            enlace.descargas--;
            await enlace.save();
            //console.log(enlace.descargas)
        }
    
    }
}