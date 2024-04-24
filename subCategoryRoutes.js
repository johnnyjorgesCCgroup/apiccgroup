import express from 'express';
import fs from 'fs';

const router = express.Router();

// GET: Obtiene todas las subcategorías
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync('dbSubCategory.json', 'utf8');
    const subcategories = JSON.parse(data);
    res.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: Obtiene una subcategoría por su ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbSubCategory.json', 'utf8');
    const subcategories = JSON.parse(data);
    const subcategory = subcategories.find(subcategory => subcategory.id === id);
    if (subcategory) {
      res.json(subcategory);
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Crea una nueva subcategoría
router.post('/', (req, res) => {
  const { id, name } = req.body;
  try {
    const data = fs.readFileSync('dbSubCategory.json', 'utf8');
    const subcategories = JSON.parse(data);
    const newSubcategory = { id, name };
    subcategories.push(newSubcategory);
    fs.writeFileSync('dbSubCategory.json', JSON.stringify(subcategories, null, 2));
    res.status(201).json(newSubcategory);
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT: Actualiza una subcategoría existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const data = fs.readFileSync('dbSubCategory.json', 'utf8');
    let subcategories = JSON.parse(data);
    const index = subcategories.findIndex(subcategory => subcategory.id === id);
    if (index !== -1) {
      subcategories[index] = { id, name };
      fs.writeFileSync('dbSubCategory.json', JSON.stringify(subcategories, null, 2));
      res.json(subcategories[index]);
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE: Elimina una subcategoría existente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbSubCategory.json', 'utf8');
    let subcategories = JSON.parse(data);
    const index = subcategories.findIndex(subcategory => subcategory.id === id);
    if (index !== -1) {
      const deletedSubcategory = subcategories.splice(index, 1);
      fs.writeFileSync('dbSubCategory.json', JSON.stringify(subcategories, null, 2));
      res.json(deletedSubcategory[0]);
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
