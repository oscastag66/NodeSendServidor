const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivosController');
const auth = require('../middleware/auth')
// subida de archivos
//const upload = multer({ dest: './uploads/' })

router.post('/',
    auth,
    archivosController.subirArchivo
);
router.get('/:archivo',
    archivosController.descargar,
    archivosController.eliminarArchivo    
)
router.delete('/',
    archivosController.eliminarArchivo
);

module.exports = router;