// ============================================================
// INVENTARIO COMPLETO - 48 EQUIPOS MUNDIAL 2026
// ============================================================

const GRUPOS_MUNDIAL = {
    'A': ['MEX', 'USA', 'CAN', 'PAN'],
    'B': ['ARG', 'URU', 'CHI', 'PAR'],
    'C': ['BRA', 'COL', 'ECU', 'VEN'],
    'D': ['FRA', 'ESP', 'POR', 'GER'],
    'E': ['ENG', 'NED', 'ITA', 'BEL'],
    'F': ['CRO', 'SRB', 'SUI', 'DEN'],
    'G': ['MAR', 'SEN', 'EGY', 'CMR'],
    'H': ['NGA', 'GHA', 'CIV', 'TUN'],
    'I': ['JPN', 'KOR', 'AUS', 'KSA'],
    'J': ['IRN', 'QAT', 'UAE', 'IRQ'],
    'K': ['SWE', 'POL', 'CZE', 'AUT'],
    'L': ['PER', 'NZL', 'CRC', 'JAM']
};

const NOMBRES_EQUIPOS = {
    'MEX': 'México', 'USA': 'Estados Unidos', 'CAN': 'Canadá', 'PAN': 'Panamá',
    'ARG': 'Argentina', 'URU': 'Uruguay', 'CHI': 'Chile', 'PAR': 'Paraguay',
    'BRA': 'Brasil', 'COL': 'Colombia', 'ECU': 'Ecuador', 'VEN': 'Venezuela',
    'FRA': 'Francia', 'ESP': 'España', 'POR': 'Portugal', 'GER': 'Alemania',
    'ENG': 'Inglaterra', 'NED': 'Holanda', 'ITA': 'Italia', 'BEL': 'Bélgica',
    'CRO': 'Croacia', 'SRB': 'Serbia', 'SUI': 'Suiza', 'DEN': 'Dinamarca',
    'MAR': 'Marruecos', 'SEN': 'Senegal', 'EGY': 'Egipto', 'CMR': 'Camerún',
    'NGA': 'Nigeria', 'GHA': 'Ghana', 'CIV': 'Costa de Marfil', 'TUN': 'Túnez',
    'JPN': 'Japón', 'KOR': 'Corea del Sur', 'AUS': 'Australia', 'KSA': 'Arabia Saudita',
    'IRN': 'Irán', 'QAT': 'Qatar', 'UAE': 'Emiratos Árabes', 'IRQ': 'Irak',
    'SWE': 'Suecia', 'POL': 'Polonia', 'CZE': 'República Checa', 'AUT': 'Austria',
    'PER': 'Perú', 'NZL': 'Nueva Zelanda', 'CRC': 'Costa Rica', 'JAM': 'Jamaica'
};

const INVENTARIO = {
    equipos: [],
    estampas: []
};

// Construir lista de equipos
for (const [grupo, paises] of Object.entries(GRUPOS_MUNDIAL)) {
    for (const paisId of paises) {
        INVENTARIO.equipos.push({
            id: paisId,
            nombre: NOMBRES_EQUIPOS[paisId],
            grupo: grupo,
            escudo: `https://flagpedia.net/data/flags/icon/72x54/${paisId.toLowerCase()}.png`
        });
    }
}

// Generar 20 estampas por equipo (1 escudo + 19 jugadores)
function generarEstampasEquipo(equipo) {
    const estampas = [];
    const posiciones = ['Portero', 'Defensa', 'Mediocampista', 'Delantero', 'Comodín'];
    
    // Escudo
    estampas.push({
        id: `${equipo.id}-ESC`,
        nombre: `🏆 Escudo ${equipo.nombre}`,
        equipoId: equipo.id,
        rareza: 'escudo',
        categoria: 'escudos'
    });
    
    // 19 jugadores
    for (let i = 1; i <= 19; i++) {
        const num = i.toString().padStart(2, '0');
        const pos = posiciones[(i-1) % posiciones.length];
        
        estampas.push({
            id: `${equipo.id}-JUG${num}`,
            nombre: `${pos} ${i} - ${equipo.nombre}`,
            equipoId: equipo.id,
            rareza: 'comun',
            categoria: 'jugadores'
        });
        
        // Algunas variantes raras (1 por equipo)
        if (i === 1) {
            estampas.push({
                id: `${equipo.id}-PARALELA`,
                nombre: `✦ ${pos} ${i} - ${equipo.nombre} (Paralela)`,
                equipoId: equipo.id,
                rareza: 'paralela_azul',
                categoria: 'paralelas'
            });
        }
    }
    
    return estampas;
}

// Especiales globales
function generarEspeciales() {
    const especiales = [];
    
    // Promociones
    for (let i = 1; i <= 10; i++) {
        especiales.push({
            id: `PROMO-${i}`,
            nombre: `🎁 Promo Coca-Cola #${i}`,
            equipoId: null,
            rareza: 'promo_cocacola',
            categoria: 'promociones'
        });
    }
    
    // Leyendas
    const leyendas = ['Maradona', 'Pelé', 'Messi', 'Cristiano Ronaldo', 'Zidane', 'Ronaldinho'];
    leyendas.forEach((leyenda, idx) => {
        especiales.push({
            id: `LEY-${idx+1}`,
            nombre: `⭐ Leyenda: ${leyenda}`,
            equipoId: null,
            rareza: 'especial',
            categoria: 'leyendas'
        });
    });
    
    return especiales;
}

// Ensamblar inventario
INVENTARIO.equipos.forEach(equipo => {
    INVENTARIO.estampas.push(...generarEstampasEquipo(equipo));
});
INVENTARIO.estampas.push(...generarEspeciales());

console.log(`✅ Inventario cargado: ${INVENTARIO.estampas.length} estampas de ${INVENTARIO.equipos.length} equipos`);