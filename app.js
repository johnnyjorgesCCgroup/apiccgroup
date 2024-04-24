import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import productRoutes from './productRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subCategoryRoutes from './subCategoryRoutes.js';
import incidentsRoutes from './incidentsRoutes.js';
import inventarioRoutes from './inventarioRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { procesarDatos} from './procesarDatos.js';

config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cvimport.com',
    'https://api.cvimport.com',
    'http://172.208.27.164',
    'http://cc.cvimport.com',
    'http://api2.cvimport.com'
  ]
}));


app.use(express.json());

// Usa las rutas de tickets
app.use('/tickets', ticketRoutes);

// Usa las rutas de productos
app.use('/products', productRoutes);

// Usa las rutas de productos
app.use('/category', categoryRoutes);

// Usa las rutas de productos
app.use('/subcategory', subCategoryRoutes);

// Usa las rutas de productos
app.use('/incidents', incidentsRoutes);

// Usa las rutas de productos
app.use('/inventario', inventarioRoutes);

// Usa las rutas de carga de imágenes
app.use('/uploads', uploadRoutes);

// Configuración de Swagger
const swaggerDocument = YAML.load('./swagger.yaml'); // Ruta al archivo OpenAPI

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta para procesar los datos y devolver el resultado
app.get('/procesarDatos', async (req, res) => {
    try {
        const result = await procesarDatos();
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar los datos.' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
