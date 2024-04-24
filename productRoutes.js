import express from 'express';
import fs from 'fs';

const router = express.Router();

// GET: Obtiene todos los productos
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync('dbProducts.json', 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: Obtiene un producto por su ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbProducts.json', 'utf8');
    const products = JSON.parse(data);
    const product = products.find(product => product.id === id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Crea un nuevo producto
router.post('/', (req, res) => {
  const { id, name, price } = req.body;
  try {
    const data = fs.readFileSync('dbProducts.json', 'utf8');
    const products = JSON.parse(data);
    const newProduct = { id, name, price };
    products.push(newProduct);
    fs.writeFileSync('dbProducts.json', JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT: Actualiza un producto existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const data = fs.readFileSync('dbProducts.json', 'utf8');
    let products = JSON.parse(data);
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      products[index] = { id, name, price };
      fs.writeFileSync('dbProducts.json', JSON.stringify(products, null, 2));
      res.json(products[index]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE: Elimina un producto existente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbProducts.json', 'utf8');
    let products = JSON.parse(data);
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      const deletedProduct = products.splice(index, 1);
      fs.writeFileSync('dbProducts.json', JSON.stringify(products, null, 2));
      res.json(deletedProduct[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
