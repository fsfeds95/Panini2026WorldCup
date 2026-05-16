// ============================================================
// APP MÓVIL - GESTIÓN TÁCTIL Y RENDIMIENTO
// ============================================================

let timeoutId = null;
let isTouchDevice = 'ontouchstart' in window;

// --- Persistencia ---
function obtenerColeccion() {
    const guardado = localStorage.getItem('coleccionPanini2026');
    return guardado ? JSON.parse(guardado) : {};
}

function guardarColeccion(coleccion) {
    localStorage.setItem('coleccionPanini2026', JSON.stringify(coleccion));
}

// --- Lógica táctil: long press vs tap ---
function manejarToque(estampaId, elemento) {
    let timer;
    const touchStart = (e) => {
        if (e.type === 'touchstart') {
            timer = setTimeout(() => {
                // Long press → repetida
                marcarRepetida(estampaId);
                if (navigator.vibrate) navigator.vibrate(50);
                elemento.style.transform = 'scale(0.95)';
                setTimeout(() => elemento.style.transform = '', 150);
            }, 500);
        }
    };
    
    const touchEnd = (e) => {
        if (timer) clearTimeout(timer);
        if (e.type === 'touchend') {
            // Tap normal → toggle
            toggleEstampa(estampaId);
            if (navigator.vibrate) navigator.vibrate(20);
        }
    };
    
    elemento.addEventListener('touchstart', touchStart);
    elemento.addEventListener('touchend', touchEnd);
    elemento.addEventListener('touchcancel', () => clearTimeout(timer));
    
    // Para ratón: clic derecho = repetida
    elemento.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        marcarRepetida(estampaId);
        return false;
    });
    
    elemento.addEventListener('click', (e) => {
        if (!isTouchDevice) toggleEstampa(estampaId);
    });
}

function toggleEstampa(id) {
    const coleccion = obtenerColeccion();
    if (coleccion[id] && coleccion[id].tengo === 1) {
        coleccion[id].tengo = 2;
        coleccion[id].repetida = true;
    } else if (coleccion[id] && coleccion[id].tengo === 2) {
        delete coleccion[id];
    } else {
        coleccion[id] = { tengo: 1, repetida: false };
    }
    guardarColeccion(coleccion);
    actualizarTodo();
}

function marcarRepetida(id) {
    const coleccion = obtenerColeccion();
    if (coleccion[id] && coleccion[id].tengo === 1) {
        coleccion[id].tengo = 2;
        coleccion[id].repetida = true;
    } else if (coleccion[id] && coleccion[id].tengo === 2) {
        coleccion[id].tengo = 1;
        coleccion[id].repetida = false;
    } else if (!coleccion[id]) {
        coleccion[id] = { tengo: 2, repetida: true };
    }
    guardarColeccion(coleccion);
    actualizarTodo();
}

// --- Estadísticas optimizadas ---
function actualizarEstadisticas() {
    const coleccion = obtenerColeccion();
    const total = INVENTARIO.estampas.length;
    const tengo = Object.values(coleccion).filter(e => e.tengo > 0).length;
    const repetidas = Object.values(coleccion).filter(e => e.tengo === 2).length;
    
    document.getElementById('total').textContent = total;
    document.getElementById('tengo').textContent = tengo;
    document.getElementById('faltan').textContent = total - tengo;
    document.getElementById('porcentaje').textContent = Math.round((tengo / total) * 100) + '%';
    document.getElementById('repetidas').textContent = repetidas;
}

// --- Filtros con debounce ---
let timeoutFiltro;
function obtenerEstampasFiltradas() {
    const coleccion = obtenerColeccion();
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const grupo = document.getElementById('filtroGrupo').value;
    const equipoId = document.getElementById('filtroEquipo').value;
    const soloFaltan = document.getElementById('mostrarSoloFaltan').checked;
    
    return INVENTARIO.estampas.filter(e => {
        if (soloFaltan && coleccion[e.id]?.tengo > 0) return false;
        if (equipoId && e.equipoId !== equipoId) return false;
        if (grupo) {
            const equipo = INVENTARIO.equipos.find(eq => eq.id === e.equipoId);
            if (!equipo || equipo.grupo !== grupo) return false;
        }
        if (busqueda && !e.nombre.toLowerCase().includes(busqueda)) return false;
        return true;
    });
}

// --- Renderizado de equipos ---
function renderizarGridEquipos() {
    const grid = document.getElementById('gridEquipos');
    const coleccion = obtenerColeccion();
    
    grid.innerHTML = INVENTARIO.equipos.map(equipo => {
        const estampasEquipo = INVENTARIO.estampas.filter(e => e.equipoId === equipo.id);
        const tengo = estampasEquipo.filter(e => coleccion[e.id]?.tengo > 0).length;
        const total = estampasEquipo.length;
        
        return `
            <div class="tarjeta-equipo" data-equipo-id="${equipo.id}">
                <img src="${equipo.escudo}" alt="${equipo.nombre}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/60?text=🏆'">
                <h4>${equipo.nombre}</h4>
                <span class="progreso">${tengo}/${total} (${Math.round(tengo/total*100)}%)</span>
            </div>
        `;
    }).join('');
    
    // Eventos táctiles para equipos
    document.querySelectorAll('.tarjeta-equipo').forEach(el => {
        const equipoId = el.dataset.equipoId;
        el.addEventListener('click', () => mostrarDetalleEquipo(equipoId));
    });
}

function mostrarDetalleEquipo(equipoId) {
    const equipo = INVENTARIO.equipos.find(e => e.id === equipoId);
    if (!equipo) return;
    
    document.getElementById('gridEquipos').style.display = 'none';
    document.getElementById('detalleEquipo').classList.remove('oculto');
    document.getElementById('nombreEquipoSeleccionado').textContent = `${equipo.nombre} (Grupo ${equipo.grupo})`;
    
    const coleccion = obtenerColeccion();
    const estampasEquipo = INVENTARIO.estampas.filter(e => e.equipoId === equipoId);
    
    const container = document.getElementById('plantillaEquipo');
    container.innerHTML = '';
    
    estampasEquipo.forEach(estampa => {
        const enColeccion = coleccion[estampa.id];
        const tiene = enColeccion?.tengo === 1;
        const repetida = enColeccion?.tengo === 2;
        
        let clases = 'estampa';
        if (tiene) clases += ' tengo';
        if (repetida) clases += ' repetida';
        
        const div = document.createElement('div');
        div.className = clases;
        div.innerHTML = `
            <div class="nombre-jugador">${estampa.nombre}</div>
            ${estampa.rareza !== 'comun' ? `<span class="rareza-badge">${estampa.rareza.replace(/_/g, ' ')}</span>` : ''}
            <div class="placeholder-icon">${!tiene && !repetida ? '⬜' : (tiene ? '✓' : '🔄')}</div>
        `;
        
        manejarToque(estampa.id, div);
        container.appendChild(div);
    });
}

function volverAEquipos() {
    document.getElementById('gridEquipos').style.display = 'grid';
    document.getElementById('detalleEquipo').classList.add('oculto');
}

// --- Vistas dinámicas ---
function renderizarVistaEspeciales() {
    const especiales = INVENTARIO.estampas.filter(e => ['promociones', 'leyendas'].includes(e.categoria));
    const coleccion = obtenerColeccion();
    const container = document.getElementById('listaEspeciales');
    container.innerHTML = '';
    
    especiales.forEach(estampa => {
        const enColeccion = coleccion[estampa.id];
        const tiene = enColeccion?.tengo === 1;
        const repetida = enColeccion?.tengo === 2;
        
        let clases = 'estampa';
        if (tiene) clases += ' tengo';
        if (repetida) clases += ' repetida';
        
        const div = document.createElement('div');
        div.className = clases;
        div.innerHTML = `
            <div class="nombre-jugador">${estampa.nombre}</div>
            <span class="rareza-badge">${estampa.rareza}</span>
            <div class="placeholder-icon">${!tiene && !repetida ? '⬜' : (tiene ? '✓' : '🔄')}</div>
        `;
        manejarToque(estampa.id, div);
        container.appendChild(div);
    });
}

function renderizarVistaFaltantes() {
    const filtradas = obtenerEstampasFiltradas().filter(e => {
        const coleccion = obtenerColeccion();
        return !coleccion[e.id] || coleccion[e.id].tengo === 0;
    });
    
    const container = document.getElementById('listaFaltantes');
    container.innerHTML = '';
    
    if (filtradas.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:2rem;">🎉 ¡No te faltan estampas! 🎉</p>';
        return;
    }
    
    filtradas.forEach(estampa => {
        const div = document.createElement('div');
        div.className = 'estampa';
        div.innerHTML = `
            <div class="nombre-jugador">${estampa.nombre}</div>
            <span class="rareza-badge">${estampa.rareza}</span>
            <div class="placeholder-icon">⬜</div>
        `;
        manejarToque(estampa.id, div);
        container.appendChild(div);
    });
}

function renderizarVistaRepetidas() {
    const coleccion = obtenerColeccion();
    const repetidas = Object.entries(coleccion)
        .filter(([id, datos]) => datos.tengo === 2)
        .map(([id]) => INVENTARIO.estampas.find(e => e.id === id))
        .filter(e => e);
    
    const container = document.getElementById('listaRepetidas');
    container.innerHTML = '';
    
    if (repetidas.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:2rem;">🔄 No tienes estampas repetidas</p>';
        return;
    }
    
    repetidas.forEach(estampa => {
        const div = document.createElement('div');
        div.className = 'estampa repetida tengo';
        div.innerHTML = `
            <div class="nombre-jugador">${estampa.nombre}</div>
            <span class="rareza-badge">${estampa.rareza}</span>
            <div class="placeholder-icon">🔄</div>
        `;
        manejarToque(estampa.id, div);
        container.appendChild(div);
    });
}

// --- Actualización general con debounce ---
let updateTimeout;
function actualizarTodo() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        actualizarEstadisticas();
        
        const vistaActiva = document.querySelector('.vista.activa')?.id;
        if (vistaActiva === 'vistaEquipos') {
            if (!document.getElementById('detalleEquipo').classList.contains('oculto')) return;
            renderizarGridEquipos();
        } else if (vistaActiva === 'vistaEspeciales') {
            renderizarVistaEspeciales();
        } else if (vistaActiva === 'vistaFaltantes') {
            renderizarVistaFaltantes();
        } else if (vistaActiva === 'vistaRepetidas') {
            renderizarVistaRepetidas();
        }
    }, 50);
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // Llenar select de equipos según grupo
    const selectEquipo = document.getElementById('filtroEquipo');
    const selectGrupo = document.getElementById('filtroGrupo');
    
    function actualizarSelectEquipos() {
        const grupoSeleccionado = selectGrupo.value;
        selectEquipo.innerHTML = '<option value="">Todos los equipos</option>';
        
        INVENTARIO.equipos.forEach(equipo => {
            if (!grupoSeleccionado || equipo.grupo === grupoSeleccionado) {
                const option = document.createElement('option');
                option.value = equipo.id;
                option.textContent = `${equipo.nombre} (Grupo ${equipo.grupo})`;
                selectEquipo.appendChild(option);
            }
        });
    }
    
    selectGrupo.addEventListener('change', () => {
        actualizarSelectEquipos();
        actualizarTodo();
    });
    
    actualizarSelectEquipos();
    
    // Eventos de filtros
    document.getElementById('busqueda').addEventListener('input', actualizarTodo);
    selectEquipo.addEventListener('change', actualizarTodo);
    document.getElementById('mostrarSoloFaltan').addEventListener('change', actualizarTodo);
    document.getElementById('btnVolver').addEventListener('click', volverAEquipos);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            
            const vistaId = btn.dataset.vista;
            document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
            
            if (vistaId === 'equipos') {
                document.getElementById('vistaEquipos').classList.add('activa');
                document.getElementById('detalleEquipo').classList.add('oculto');
                document.getElementById('gridEquipos').style.display = 'grid';
                renderizarGridEquipos();
            } else if (vistaId === 'especiales') {
                document.getElementById('vistaEspeciales').classList.add('activa');
                renderizarVistaEspeciales();
            } else if (vistaId === 'faltantes') {
                document.getElementById('vistaFaltantes').classList.add('activa');
                renderizarVistaFaltantes();
            } else if (vistaId === 'repetidas-tab') {
                document.getElementById('vistaRepetidas').classList.add('activa');
                renderizarVistaRepetidas();
            }
        });
    });
    
    // Reset
    document.getElementById('btnReset').addEventListener('click', () => {
        if (confirm('⚠️ ¿Borrar toda tu colección? Esta acción es irreversible.')) {
            localStorage.removeItem('coleccionPanini2026');
            actualizarTodo();
            if (document.getElementById('vistaEquipos').classList.contains('activa')) {
                renderizarGridEquipos();
            }
            alert('✅ Colección reiniciada');
        }
    });
    
    // Render inicial
    renderizarGridEquipos();
    actualizarEstadisticas();
});