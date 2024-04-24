// inventoryRoutes.js
import express from 'express';
import { pool } from './db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventario');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM inventario WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, estado, detalles, empleado, area} = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO inventario (nombre, estado, detalles, empleado, area) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, estado, detalles, empleado, area]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, estado, detalles, empleado, area } = req.body;
  try {
    const result = await pool.query(
      'UPDATE inventario SET nombre = $1, estado = $2, detalles = $3, empleado = $4, area = $5 WHERE id = $6 RETURNING *',
      [nombre, estado, detalles, empleado, area, id]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM inventario WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;