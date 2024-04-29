// inventoryRoutes.js
import express from 'express';
import fetch from 'node-fetch';
import { pool } from './db.js';

const router = express.Router();

router.get('/procesarDatos2', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener los IDs existentes en la base de datos
    const existingIdsResult = await client.query('SELECT id FROM pedido');
    const existingIds = existingIdsResult.rows.map(row => row.id);

    console.log('Validando datos de la API...');

    // Consultar la API para obtener nuevos datos
    const response = await fetch('http://cc.cvimport.com:3000/procesarDatos');
    if (!response.ok) {
      throw new Error('Error al obtener los datos de la API');
    }
    const data = await response.json();

    // Filtrar los datos para obtener solo los registros con IDs nuevos
    const nuevosRegistros = data.filter(item => !existingIds.includes(item.id));

    // Insertar los nuevos registros en la base de datos
    for (const item of nuevosRegistros) {
      const query = `
        INSERT INTO pedido (
          id, origin, date, date_cut, oc, phone, client, address, distrito,
          document_number, document_type, code, status, product_id, product,
          quantity, price, anio, mes, dia, created_at, updated_at, initialWarehouse, isdeliveryccg,
          ischange, productchange, skuchange, photo, user_id, worker_id, ubigeo,
          people_id, idMove, whatMove, idIncident, whatIncident, imageArchive
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
                $30, $31, $32, $33, $34, $35, $36, $37)
      `;
      const values = [
        item.id, item.origin, item.date, item.date_cut, item.oc, item.phone, item.client,
        item.address, item.distrito, item.document_number, item.document_type,
        item.code, item.status, item.product_id, item.product, item.quantity,
        item.price, item.year, item.month, item.day, item.created_at, item.updated_at, item.initialWarehouse,
        item.isdeliveryccg, item.ischange, item.productchange, item.skuchange,
        item.photo, item.user_id, item.worker_id, item.ubigeo, item.people_id,
        item.idMove, item.whatMove, item.idIncident, item.whatIncident,
        item.imageArchive
      ];
      await client.query(query, values);
      console.log(`Registro insertado con ID: ${item.id}`);
      console.log('Datos del registro:', item);
    }

    client.release();
    console.log('Datos insertados correctamente en la base de datos.');
    res.json({ message: 'Datos insertados correctamente en la base de datos.' });
  } catch (error) {
    console.error('Hubo un error al insertar los datos:', error);
    res.status(500).json({ error: 'Hubo un error al insertar los datos en la base de datos.' });
  }
});

export default router;
