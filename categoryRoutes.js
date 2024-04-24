import express from 'express';
import fs from 'fs';

const router = express.Router();

// GET: Obtiene todas las categorías
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync('dbCategory.json', 'utf8');
    const categories = JSON.parse(data);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: Obtiene una categoría por su ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbCategory.json', 'utf8');
    const categories = JSON.parse(data);
    const category = categories.find(category => category.id === id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Crea una nueva categoría
router.post('/', (req, res) => {
  const { id, name } = req.body;
  try {
    const data = fs.readFileSync('dbCategory.json', 'utf8');
    const categories = JSON.parse(data);
    const newCategory = { id, name };
    categories.push(newCategory);
    fs.writeFileSync('dbCategory.json', JSON.stringify(categories, null, 2));
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT: Actualiza una categoría existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const data = fs.readFileSync('dbCategory.json', 'utf8');
    let categories = JSON.parse(data);
    const index = categories.findIndex(category => category.id === id);
    if (index !== -1) {
      categories[index] = { id, name };
      fs.writeFileSync('dbCategory.json', JSON.stringify(categories, null, 2));
      res.json(categories[index]);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE: Elimina una categoría existente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbCategory.json', 'utf8');
    let categories = JSON.parse(data);
    const index = categories.findIndex(category => category.id === id);
    if (index !== -1) {
      const deletedCategory = categories.splice(index, 1);
      fs.writeFileSync('dbCategory.json', JSON.stringify(categories, null, 2));
      res.json(deletedCategory[0]);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
