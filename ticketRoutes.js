// ticketRoutes.js
import express from 'express';
import { pool } from './db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { usuario, tipologia, urgente, comentario, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tickets (usuario, tipologia, urgente, comentario, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [usuario, tipologia, urgente, comentario, estado]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario, tipologia, urgente, comentario, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tickets SET usuario = $1, tipologia = $2, urgente = $3, comentario = $4, estado = $5 WHERE id = $6 RETURNING *',
      [usuario, tipologia, urgente, comentario, estado, id]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
