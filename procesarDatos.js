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

        const [cutData, movesData, incidentData, imageList] = await Promise.all([
            cutResponse.json(),
            movesResponse.json(),
            incidentResponse.json(),
            getImageList()
        ]);
        
        const movesMap = new Map(movesData.data.map(move => [move.document_number, move]));
        const incidentsMap = new Map(incidentData.data.map(incident => [incident.oc, incident]));

        const result = cutData.data.map(cut => {
            const matchingMove = movesMap.get(cut.oc);
            const hasMove = !!matchingMove;
            const matchingIncident = incidentsMap.get(cut.oc);
            const hasIncident = !!matchingIncident;
            const matchingImage = imageList.find(image => image.oc === cut.oc);
            const imageArchive = matchingImage ? matchingImage.archive : null;
            return {
                ...cut,
                idMove: matchingMove ? matchingMove.id : null,
                whatMove: hasMove,
                idIncident: matchingIncident ? matchingIncident.id : null,
                whatIncident: hasIncident,
                imageArchive
            };
        });

        return result;
    } catch (error) {
        throw new Error('Hubo un error al procesar los datos: ' + error.message);
    }
}
