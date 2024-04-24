import express from 'express';
import { pool } from './db.js'; // Asegúrate de que la ruta sea correcta según la ubicación de tu archivo db.js
import bcrypt from 'bcrypt';

const router = express.Router();

// Endpoint para iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca el usuario en la base de datos por su email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Compara la contraseña proporcionada con la almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Si la autenticación es exitosa, puedes enviar una respuesta con algún token de autenticación
    // Aquí puedes generar un token JWT o cualquier otro mecanismo de autenticación que desees

    res.json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener la lista de usuarios
router.get('/users', async (req, res) => {
  try {
    // Obtener la lista de usuarios desde la base de datos
    const result = await pool.query('SELECT * FROM users');
    const users = result.rows;

    res.json({ message: 'Lista de usuarios', data: users });
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;