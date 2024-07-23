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
  const formattedStatusEmpaquetado = dayjs(statusEmpaquetado).format('YYYY-MM-DD');
  const formattedStatusEnRuta = dayjs(statusEnRuta).format('YYYY-MM-DD');
  const formattedStatusEntregado = dayjs(statusEntregado).format('YYYY-MM-DD');
  try {
    const result = await pool.query(
      'INSERT INTO estado (oc, statusEmpaquetado, usuarioEmpaquetado, statusEnRuta, usuarioEnRuta, statusEntregado, usuarioEntregado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [oc, formattedStatusEmpaquetado, usuarioEmpaquetado, formattedStatusEnRuta, usuarioEnRuta, formattedStatusEntregado, usuarioEntregado]
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
  const formattedStatusEmpaquetado = dayjs(statusEmpaquetado).format('YYYY-MM-DD');
  const formattedStatusEnRuta = dayjs(statusEnRuta).format('YYYY-MM-DD');
  const formattedStatusEntregado = dayjs(statusEntregado).format('YYYY-MM-DD');
  try {
    const result = await pool.query(
      'UPDATE estado SET statusEmpaquetado = $1, usuarioEmpaquetado = $2, statusEnRuta = $3, usuarioEnRuta = $4, statusEntregado = $5, usuarioEntregado = $6 WHERE oc = $7 RETURNING *',
      [formattedStatusEmpaquetado, usuarioEmpaquetado, formattedStatusEnRuta, usuarioEnRuta, formattedStatusEntregado, usuarioEntregado, oc]
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
