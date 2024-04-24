import express from 'express';
import fs from 'fs';

const router = express.Router();

// GET: Obtiene todos los incidentes
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync('dbIncidents.json', 'utf8');
    const incidents = JSON.parse(data);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: Obtiene un incidente por su ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbIncidents.json', 'utf8');
    const incidents = JSON.parse(data);
    const incident = incidents.find(incident => incident.id === id);
    if (incident) {
      res.json(incident);
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Crea un nuevo incidente
router.post('/', (req, res) => {
  const newIncident = req.body;
  try {
    const data = fs.readFileSync('dbIncidents.json', 'utf8');
    const incidents = JSON.parse(data);
    incidents.push(newIncident);
    fs.writeFileSync('dbIncidents.json', JSON.stringify(incidents, null, 2));
    res.status(201).json(newIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT: Actualiza un incidente existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedIncident = req.body;
  try {
    const data = fs.readFileSync('dbIncidents.json', 'utf8');
    let incidents = JSON.parse(data);
    const index = incidents.findIndex(incident => incident.id === id);
    if (index !== -1) {
      incidents[index] = updatedIncident;
      fs.writeFileSync('dbIncidents.json', JSON.stringify(incidents, null, 2));
      res.json(incidents[index]);
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE: Elimina un incidente existente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const data = fs.readFileSync('dbIncidents.json', 'utf8');
    let incidents = JSON.parse(data);
    const index = incidents.findIndex(incident => incident.id === id);
    if (index !== -1) {
      const deletedIncident = incidents.splice(index, 1);
      fs.writeFileSync('dbIncidents.json', JSON.stringify(incidents, null, 2));
      res.json(deletedIncident[0]);
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
