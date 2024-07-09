import fetch from 'node-fetch';

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

        // Crear mapas para búsqueda rápida
        const movesMap = new Map();
        movesData.data.forEach(move => {
            if (!movesMap.has(move.document_number)) {
                movesMap.set(move.document_number, []);
            }
            movesMap.get(move.document_number).push(move);
        });

        const incidentsMap = new Map();
        incidentData.data.forEach(incident => {
            if (!incidentsMap.has(incident.oc)) {
                incidentsMap.set(incident.oc, []);
            }
            incidentsMap.get(incident.oc).push(incident);
        });

        const result = cutData.data.map(cut => {
            const matchingMoves = movesMap.get(cut.oc) || [];
            const numMoves = matchingMoves.length;
        
            const matchingIncidents = incidentsMap.get(cut.oc) || [];
            const numIncidents = matchingIncidents.length; // Contamos cuántos incidentes están asociados a este corte
        
            return {
                ...cut,
                idMove: numMoves > 0 ? matchingMoves[0].id : null,
                dateMove: numMoves > 0 ? matchingMoves[0].date : null,
                userMove: numMoves > 0 ? matchingMoves[0].user_id : null,
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
