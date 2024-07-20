import express from 'express';
import { pool } from './db.js';
import dayjs from 'dayjs';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM revision');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM revision WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Revision not found' });
    }
  } catch (error) {
    console.error('Error fetching revision:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { oc, date, usuario, revision } = req.body;
  const formattedDate = dayjs(date).format('YYYY-MM-DD');
  try {
    const result = await pool.query(
      'INSERT INTO revision (oc, date, usuario, revision) VALUES ($1, $2, $3, $4) RETURNING *',
      [oc, formattedDate, usuario, revision]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating revision:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { oc, date, usuario, revision } = req.body;
  const formattedDate = dayjs(date).format('YYYY-MM-DD');
  try {
    const result = await pool.query(
      'UPDATE revision SET oc = $1, date = $2, usuario = $3, revision = $4 WHERE id = $5 RETURNING *',
      [oc, formattedDate, usuario, revision, id]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Revision not found' });
    }
  } catch (error) {
    console.error('Error updating revision:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM revision WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    } else {
      return res.status(404).json({ error: 'Revision not found' });
    }
  } catch (error) {
    console.error('Error deleting revision:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
