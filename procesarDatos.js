import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function getImageList() {
    try {
        const imageFiles = await fs.promises.readdir('salidas/evidenciasOC/');
        const imageList = imageFiles.map((imageName) => {
            const oc = path.parse(imageName).name;
            return { oc, archive: imageName };
        });
        return imageList;
    } catch (err) {
        console.error(err);
        throw new Error('Error al obtener la lista de imágenes');
    }
}

// Función para procesar los datos
export async function procesarDatos() {
    try {
        const [cutResponse, movesResponse, incidentResponse] = await Promise.all([
            fetch('https://api.cvimport.com/api/cut'),
            fetch('https://api.cvimport.com/api/inventoryMoves'),
            fetch('https://api.cvimport.com/api/incident')
        ]);

        if (!cutResponse.ok || !movesResponse.ok || !incidentResponse.ok) {
            throw new Error('Error al obtener los datos');
        }

        const [cutData, movesData, incidentData] = await Promise.all([
            cutResponse.json(),
            movesResponse.json(),
            incidentResponse.json(),
        ]);

        const result = cutData.data.map(cut => {
            const matchingMoves = movesData.data.filter(move => move.document_number === cut.oc);
            const numMoves = matchingMoves.length;
        
            const matchingIncidents = incidentData.data.filter(incident => incident.oc === cut.oc);
            const numIncidents = matchingIncidents.length; // Contamos cuántos incidentes están asociados a este corte
        
            return {
                ...cut,
                idMove: numMoves > 0 ? matchingMoves[0].id : null,
                numMoves,
                idIncident: numIncidents > 0 ? matchingIncidents[0].id : null,
                numIncidents
            };
        });
        

        return result;
    } catch (error) {
        throw new Error('Hubo un error al procesar los datos: ' + error.message);
    }
}
