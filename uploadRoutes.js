import express from "express";
import multer from "multer"; 
import fs from "node:fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const upload = multer({ dest: 'salidas/evidenciasOC/' });

let idCounter = 1; // Variable para mantener el contador de ID

router.post('/images/single', upload.single('imagenEvidencia'), (req, res) => {
    console.log(req.file);
    const orderNumber = req.query.orderNumber; // Obtener el número de orden de la consulta
    saveImage(req.file, orderNumber);
    res.send('Termina');
});

router.post('/images/multi', upload.array('photos', 10), (req, res) => {
    req.files.map(file => {
        const orderNumber = req.query.orderNumber; // Obtener el número de orden de la consulta
        saveImage(file, orderNumber);
    });
    res.send("Termina Multi")
});

router.get('/images', (req, res) => {
    try {
        const imageFiles = fs.readdirSync('salidas/evidenciasOC/');
        const imageList = imageFiles.map((imageName, index) => {
            const stat = fs.statSync(`salidas/evidenciasOC/${imageName}`);
            const id = idCounter++; // Obtener el siguiente ID y luego incrementar el contador
            const date = formatDate(stat.birthtime); // Formatear la fecha
            const archive = imageName;
            const oc = path.parse(imageName).name; // Obtener el nombre del archivo sin la extensión
            return { id, date, archive, oc };
        });
        res.json(imageList);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener la lista de imágenes');
    }
});

// Función para formatear la fecha en formato dd-mm-yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

function saveImage(file, orderNumber) {
    const newPath = `./salidas/evidenciasOC/${orderNumber}.png`; // Usar el número de orden como nombre del archivo
    fs.renameSync(file.path, newPath);
    return newPath;
}

export default router;
