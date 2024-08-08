import express from 'express';
import { pool } from './db.js';
import dayjs from 'dayjs';

const router = express.Router();

// Obtener todos los registros de la tabla estado
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estado');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching estados:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Obtener un registro específico de la tabla estado por OC
router.get('/:oc', async (req, res) => {
  const { oc } = req.params;
  try {
    const result = await pool.query('SELECT * FROM estado WHERE oc = $1', [oc]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Estado not found' });
    }
  } catch (error) {
    console.error('Error fetching estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Crear un nuevo registro en la tabla estado
router.post('/', async (req, res) => {
  const { oc, statusEmpaquetado, usuarioEmpaquetado, statusEnRuta, usuarioEnRuta, statusEntregado, usuarioEntregado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO estado (oc, statusEmpaquetado, usuarioEmpaquetado, statusEnRuta, usuarioEnRuta, statusEntregado, usuarioEntregado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [oc, statusEmpaquetado, usuarioEmpaquetado, statusEnRuta, usuarioEnRuta, statusEntregado, usuarioEntregado]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Actualizar un registro específico de la tabla estado por OC
router.put('/:oc', async (req, res) => {
  const { oc } = req.params;
  const { statusEmpaquetado, usuarioEmpaquetado, statusEnRuta, usuarioEnRuta, statusEntregado, usuarioEntregado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estado SET statusEmpaquetado = $1, usuarioEmpaquetado = $2, statusEnRuta = $3, usuarioEnRuta = $4, statusEntregado = $5, usuarioEntregado = $6 WHERE oc = $7 RETURNING *',
      [statusEmpaquetado, usuarioEmpaquetado, statusEnRuta, usuarioEnRuta, statusEntregado, usuarioEntregado, oc]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Estado not found put:oc' });
    }
  } catch (error) {
    console.error('Error updating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/entregado/:oc', async (req, res) => {
  const { oc } = req.params;
  const { statusEntregado, usuarioEntregado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estado SET statusEntregado = $1, usuarioEntregado = $2 WHERE oc = $3 RETURNING *',
      [statusEntregado, usuarioEntregado, oc]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Estado not found' });
    }
  } catch (error) {
    console.error('Error updating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/enruta/:oc', async (req, res) => {
  const { oc } = req.params;
  const { statusEnRuta, usuarioEnRuta } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estado SET statusEnRuta = $1, usuarioEnRuta = $2 WHERE oc = $3 RETURNING *',
      [statusEnRuta, usuarioEnRuta, oc]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Estado not found' });
    }
  } catch (error) {
    console.error('Error updating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/evidencia/:oc', async (req, res) => {
  const { oc } = req.params;
  const { list_status, obs_status, img_status, fecha_evidencia } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estado SET list_status = $1, obs_status = $2, img_status = $3, fecha_evidencia = $4 WHERE oc = $5 RETURNING *',
      [list_status, obs_status, img_status, fecha_evidencia, oc]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Estado not found' });
    }
  } catch (error) {
    console.error('Error updating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/masive/enruta', async (req, res) => {
  const updates = req.body; // Espera un array de objetos { oc, statusEnRuta, usuarioEnRuta }

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Invalid data format. Expecting an array of updates.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updatePromises = updates.map(({ oc, statusEnRuta, usuarioEnRuta }) => {
      console.log(`Updating OC: ${oc}, statusEnRuta: ${statusEnRuta}, usuarioEnRuta: ${usuarioEnRuta}`);
      return client.query(
        'UPDATE estado SET statusEnRuta = $1, usuarioEnRuta = $2 WHERE oc = $3 RETURNING *',
        [statusEnRuta, usuarioEnRuta, oc]
      );
    });

    const results = await Promise.all(updatePromises);

    // Verifica si se encontraron y actualizaron todas las OCs proporcionadas
    const notFoundOCs = updates.filter((_, index) => results[index].rowCount === 0).map(update => update.oc);
    if (notFoundOCs.length > 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Some OCs not found', notFoundOCs });
    }

    await client.query('COMMIT');

    const updatedRows = results.map(result => result.rows[0]);
    res.json(updatedRows);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Eliminar un registro específico de la tabla estado por OC
router.delete('/:oc', async (req, res) => {
  const { oc } = req.params;
  try {
    const result = await pool.query('DELETE FROM estado WHERE oc = $1 RETURNING *', [oc]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Estado not found' });
    }
  } catch (error) {
    console.error('Error deleting estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
