import express from "express";
import multer from "multer"; 
import fs from "node:fs";
import path from "path";
import { pool } from './db.js';

const router = express.Router();

const upload = multer({ dest: 'salidas/evidenciasOC/' });

router.post('/images/single', upload.single('imagenEvidencia'), (req, res) => {
    console.log(req.file);
    const { orderNumber } = req.query; // Obtener los datos de la consulta
    saveImage(req.file, orderNumber); // Asegúrate de pasar los valores correctos aquí
    res.send('Termina');
});


router.post('/images/multi', upload.array('photos', 10), (req, res) => {
    req.files.map(file => {
        const orderNumber = req.query.orderNumber; // Obtener el número de orden de la consulta
        saveImage(file, orderNumber);
    });
    res.send("Termina Multi")
});

router.get('/images', async (req, res) => {
    try {
        const queryResult = await pool.query('SELECT * FROM imagenes');
        const imageList = queryResult.rows.map(row => {
            return {
                id: row.id,
                date: formatDate(row.fecha),
                archive: row.archive,
                oc: row.oc,
            };
        });
        res.json(imageList);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener la lista de imágenes desde la base de datos');
    }
});

// Función para formatear la fecha en formato dd-mm-yyyy
function formatDate(date) {
    // Configurar la hora a la zona horaria de Lima
    const options = { timeZone: 'America/Lima', hour12: false };
    const limaDate = new Date(date.toLocaleString('en-US', options));

    // Obtener el día, mes, año, horas y minutos
    const day = String(limaDate.getDate()).padStart(2, '0');
    const month = String(limaDate.getMonth() + 1).padStart(2, '0');
    const year = limaDate.getFullYear();
    const hours = String(limaDate.getHours()).padStart(2, '0');
    const minutes = String(limaDate.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}
// Endpoint GET para obtener una imagen por su nombre de archivo
router.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.resolve('salidas/evidenciasOC/', imageName);
    try {
        if (fs.existsSync(imagePath)) {
            res.sendFile(imagePath);
        } else {
            res.status(404).send('Imagen no encontrada');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener la imagen');
    }
});

router.get('/folder-size', (req, res) => {
    // Especifica la ubicación relativa de la carpeta salidas/evidenciasOC
    const folderPath = path.join(process.cwd(), 'salidas/evidenciasOC');

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error al leer la carpeta:', err);
            return res.status(500).send('Error al leer la carpeta');
        }

        let totalSize = 0;

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        });

        // Convertir el tamaño total a kilobytes o megabytes según sea necesario
        const totalSizeKB = totalSize / 1024;
        const totalSizeMB = totalSizeKB / 1024;

        res.json({
            totalSizeBytes: totalSize,
            totalSizeKB,
            totalSizeMB
        });
    });
});

function saveImage(file, orderNumber) {
    const fileExtension = path.extname(file.originalname); // Obtener la extensión del archivo
    const newPath = `./salidas/evidenciasOC/${orderNumber}${fileExtension}`;
    fs.renameSync(file.path, newPath);
    
    // Insertar la información de la imagen en la base de datos
    pool.query('INSERT INTO imagenes (fecha, archive, oc) VALUES ($1, $2, $3)', [formatDate(new Date()), newPath, orderNumber])
        .then(() => {
            console.log('Imagen guardada en la base de datos');
            console.log('Datos guardados:', { fecha: formatDate(new Date()), archive: newPath, oc: orderNumber });
        })
        .catch(err => {
            console.error('Error al guardar la imagen en la base de datos:', err);
        });

    return newPath;
}

export default router;
