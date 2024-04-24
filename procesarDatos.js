import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Función para obtener la lista de imágenes
function getImageList() {
    try {
        const imageFiles = fs.readdirSync('salidas/evidenciasOC/');
        const imageList = imageFiles.map((imageName) => {
            const oc = path.parse(imageName).name; // Obtener el nombre del archivo sin la extensión
            return { oc, archive: imageName }; // Devolver solo el nombre del archivo y el nombre del oc
        });
        return imageList;
    } catch (err) {
        console.error(err);
        throw new Error('Error al obtener la lista de imágenes');
    }
}

// Función para procesar los datos y encontrar la correspondencia
export async function procesarDatos() {
    try {
        // Realizar solicitudes a las tres API
        const cutResponse = await fetch('https://api.cvimport.com/api/cut');
        const movesResponse = await fetch('https://api.cvimport.com/api/inventoryMoves');
        const incidentResponse = await fetch('https://api.cvimport.com/api/incident');

        // Verificar si las respuestas son exitosas
        if (!cutResponse.ok || !movesResponse.ok || !incidentResponse.ok) {
            throw new Error('Error al obtener los datos');
        }

        // Convertir las respuestas a JSON
        const cutData = await cutResponse.json();
        const movesData = await movesResponse.json();
        const incidentData = await incidentResponse.json();

        const imageList = getImageList(); // Obtener la lista de imágenes

        const result = [];

        // Iterar sobre los datos de los cortes
        cutData.data.forEach(cut => {
            // Buscar el movimiento que coincida con el documento_number del corte
            const matchingMove = movesData.data.find(move => move.document_number === cut.oc);

            // Verificar si hay un movimiento asociado
            const hasMove = matchingMove ? true : false;

            // Buscar el incidente que coincida con el documento_number del corte
            const matchingIncident = incidentData.data.find(incident => incident.oc === cut.oc);

            // Verificar si hay un incidente asociado
            const hasIncident = matchingIncident ? true : false;

            // Buscar la imagen correspondiente al oc
            const matchingImage = imageList.find(image => image.oc === cut.oc);
            const imageArchive = matchingImage ? matchingImage.archive : null;

            // Construir el objeto resultante con las nuevas columnas
            const newData = {
                ...cut,
                idMove: matchingMove ? matchingMove.id : null,
                whatMove: hasMove,
                idIncident: matchingIncident ? matchingIncident.id : null,
                whatIncident: hasIncident,
                imageArchive: imageArchive // Agregar la ruta de la imagen al objeto
            };

            result.push(newData);
        });

        return result;
    } catch (error) {
        throw new Error('Hubo un error al procesar los datos: ' + error.message);
    }
}
