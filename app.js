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
import datosProcesadosRoutes from './datosProcesadosRoutes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { procesarDatos} from './procesarDatos.js';
import procesarDatos2 from './procesarDatos2.js'

config();

const app = express();

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

app.use('/tickets', ticketRoutes);
app.use('/products', productRoutes);
app.use('/category', categoryRoutes);
app.use('/subcategory', subCategoryRoutes);
app.use('/incidents', incidentsRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/datosProcesados', datosProcesadosRoutes);
app.use('/uploads', uploadRoutes);
app.use(procesarDatos2);

const swaggerDocument = YAML.load('./swagger.yaml'); // Ruta al archivo OpenAPI

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/procesarDatos', async (req, res) => {
    try {
        const result = await procesarDatos();
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al procesar los datos.' });
    }
});

app.get('/procesarDatos/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const result = await procesarDatos();
      const data = result.find(item => item.id === parseInt(id)); 
      if (!data) {
          return res.status(404).json({ error: 'No se encontró el dato con el ID proporcionado.' });
      }
      res.json(data);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
});

app.get('/procesarDatos/search/:query', async (req, res) => {
  try {
      const { query } = req.params;
      const result = await procesarDatos();
      const filteredData = result.filter(item =>
          (item.oc && item.oc.includes(query)) ||
          (item.document_number && item.document_number.includes(query)) ||
          (item.client && item.client.includes(query))
      );
      if (filteredData.length === 0) {
          return res.status(404).json({ error: 'No se encontraron coincidencias.' });
      }
      res.json(filteredData);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
