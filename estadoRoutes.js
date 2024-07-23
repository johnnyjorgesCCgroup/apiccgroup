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

// Obtener un registro específico de la tabla estado por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM estado WHERE id = $1', [id]);
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
  const { oc, statusEmpaquetado, statusEnRuta, statusEntregado, usuario } = req.body;
  const formattedStatusEmpaquetado = dayjs(statusEmpaquetado).format('YYYY-MM-DD');
  const formattedStatusEnRuta = dayjs(statusEnRuta).format('YYYY-MM-DD');
  const formattedStatusEntregado = dayjs(statusEntregado).format('YYYY-MM-DD');
  try {
    const result = await pool.query(
      'INSERT INTO estado (oc, statusEmpaquetado, statusEnRuta, statusEntregado, usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [oc, formattedStatusEmpaquetado, formattedStatusEnRuta, formattedStatusEntregado, usuario]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating estado:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Actualizar un registro específico de la tabla estado por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { oc, statusEmpaquetado, statusEnRuta, statusEntregado, usuario } = req.body;
  const formattedStatusEmpaquetado = dayjs(statusEmpaquetado).format('YYYY-MM-DD');
  const formattedStatusEnRuta = dayjs(statusEnRuta).format('YYYY-MM-DD');
  const formattedStatusEntregado = dayjs(statusEntregado).format('YYYY-MM-DD');
  try {
    const result = await pool.query(
      'UPDATE estado SET oc = $1, statusEmpaquetado = $2, statusEnRuta = $3, statusEntregado = $4, usuario = $5 WHERE id = $6 RETURNING *',
      [oc, formattedStatusEmpaquetado, formattedStatusEnRuta, formattedStatusEntregado, usuario, id]
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

// Eliminar un registro específico de la tabla estado por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM estado WHERE id = $1 RETURNING *', [id]);
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
