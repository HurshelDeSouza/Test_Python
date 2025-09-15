// Configuración global
const API_URL = '/api/tasks';
let itemsPerPage = 5;
let currentPage = 1;

// Función global de paginación
window.loadNextPage = function(page) {
    currentPage = page;
    loadTasks(page);
};

// Variables para almacenar funciones
let loadTasksInternalFunction;
let showNewTaskModalFunction;
let hideModalFunction;

// Función global para cargar tareas
window.loadTasks = function(page = 1) {
    if (loadTasksInternalFunction) {
        return loadTasksInternalFunction(page);
    } else {
        console.log('Esperando a que se inicialice loadTasksInternal...');
    }
};

// Funciones globales de UI
window.showNewTaskModal = function() {
    if (showNewTaskModalFunction) {
        showNewTaskModalFunction();
    } else {
        console.log('Esperando a que se inicialice showNewTaskModal...');
    }
};

window.hideModal = function() {
    if (hideModalFunction) {
        hideModalFunction();
    } else {
        console.log('Esperando a que se inicialice hideModal...');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const taskContainer = document.getElementById('tasks-container');
    const taskModal = document.getElementById('task-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const taskForm = document.getElementById('task-form');
    const closeModal = document.querySelector('.close');
    const newTaskBtn = document.getElementById('new-task-btn');
    const filterBtn = document.getElementById('filter-btn');
    const searchBtn = document.getElementById('search-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    
    let taskToDelete = null;
    
    // Establecer el valor inicial del selector de elementos por página
    if (itemsPerPageSelect) itemsPerPageSelect.value = itemsPerPage.toString();
    
    // Iniciar con la primera página
    loadTasks(1);

    // Event Listeners
    if (newTaskBtn) newTaskBtn.addEventListener('click', showNewTaskModal);
    if (closeModal) closeModal.addEventListener('click', hideModal);
    if (taskForm) taskForm.addEventListener('submit', handleTaskSubmit);
    if (filterBtn) filterBtn.addEventListener('click', () => loadTasksInternalFunction(currentPage));
    if (searchBtn) searchBtn.addEventListener('click', () => {
        currentPage = 1; // Reiniciar a la primera página al buscar
        loadTasksInternalFunction(currentPage);
    });
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
    if (searchInput) searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentPage = 1; // Reiniciar a la primera página al buscar
            loadTasksInternalFunction(currentPage);
        }
    });
    if (itemsPerPageSelect) itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1; // Reiniciar a la primera página cuando cambia el número de elementos
        loadTasksInternalFunction(currentPage);
    });
    
    // Event Listeners para el modal de confirmación
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', async () => {
            if (taskToDelete) {
                await deleteTask(taskToDelete);
                taskToDelete = null;
            }
            confirmModal.style.display = 'none';
        });
    }

    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            taskToDelete = null;
            confirmModal.style.display = 'none';
        });
    }

    // Solo cerrar el modal de confirmación al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            taskToDelete = null;
            confirmModal.style.display = 'none';
        }
    });

    // Cargar tareas inicialmente
    loadTasks();

    // Hacer las funciones necesarias accesibles globalmente
    window.loadNextPage = function(page) {
        currentPage = page;
        loadTasks(page);
    };

    window.showEditTaskModal = async function(taskId) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`);
            if (!response.ok) throw new Error('Error al obtener la tarea');
            const task = await response.json();

            document.getElementById('task-id').value = task.id;
            document.getElementById('titulo').value = task.titulo;
            document.getElementById('descripcion').value = task.descripcion;
            document.getElementById('estado').value = task.estado;
            document.getElementById('prioridad').value = task.prioridad;
            
            if (task.fecha_vencimiento) {
                const fecha = new Date(task.fecha_vencimiento);
                const formatoFecha = fecha.toISOString().slice(0, 16);
                document.getElementById('fecha_vencimiento').value = formatoFecha;
            } else {
                document.getElementById('fecha_vencimiento').value = '';
            }

            document.getElementById('modal-title').textContent = 'Editar Tarea';
            taskModal.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            showError('Error al cargar la tarea');
        }
    };

    window.showDeleteConfirmation = function(taskId) {
        taskToDelete = taskId;
        document.getElementById('confirm-message').textContent = '¿Está seguro de que desea eliminar esta tarea?';
        confirmModal.style.display = 'block';
    };

    // Funciones principales
    loadTasksInternalFunction = async function(page = 1) {
        try {
            const estado = statusFilter.value;
            const prioridad = priorityFilter.value;
            const search = searchInput.value.trim();

            // Agregar parámetros de filtro, búsqueda y paginación
            const params = new URLSearchParams();
            if (estado) params.append('estado', estado);
            if (prioridad) params.append('prioridad', prioridad);
            if (search) params.append('search', search);
            params.append('page', page);
            params.append('per_page', itemsPerPage);
            
            const url = `${API_URL}?${params.toString()}`;
            console.log('Requesting URL:', url); // Debug
            
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al cargar las tareas');
            }
            
            const data = await response.json();
            console.log('Response data:', data); // Debug
            
            if (!data || !data.items || !data.pagination) {
                throw new Error('Formato de respuesta inválido');
            }
            
            currentPage = page;
            renderTasks(data);
        } catch (error) {
            console.error('Error detallado:', error);
            showError(error.message || 'Error al cargar las tareas');
        }
    }

    function renderTasks(data) {
        const { items: tasks, pagination } = data;
        
        if (!Array.isArray(tasks) || tasks.length === 0) {
            taskContainer.innerHTML = '<p class="no-tasks">No hay tareas que mostrar</p>';
            return;
        }

        let tasksHtml = tasks.map(task => `
            <div class="task-card">
                <div class="task-header">
                    <h3 class="task-title">${task.titulo}</h3>
                    <div class="task-actions">
                        <button onclick="showEditTaskModal(${task.id})" class="edit-btn">Editar</button>
                        <button onclick="showDeleteConfirmation(${task.id})" class="delete-btn btn-danger">Eliminar</button>
                    </div>
                </div>
                <p class="task-description">${task.descripcion}</p>
                <div class="task-meta">
                    <span class="task-status status-${task.estado}">${formatStatus(task.estado)}</span>
                    <span class="task-priority priority-${task.prioridad}">${formatPriority(task.prioridad)}</span>
                    ${task.fecha_vencimiento ? 
                        `<span class="task-due-date">Vence: ${formatDate(task.fecha_vencimiento)}</span>` 
                        : ''}
                </div>
            </div>
        `).join('');

        taskContainer.innerHTML = `
            <div class="tasks-grid">
                ${tasksHtml}
            </div>
            <div class="pagination">
                ${pagination.current_page > 1 ? 
                    `<button onclick="window.loadNextPage(${pagination.current_page - 1})" class="pagination-btn">&laquo; Anterior</button>` 
                    : ''}
                <span class="pagination-info">Página ${pagination.current_page} de ${pagination.total_pages}</span>
                ${pagination.has_next ? 
                    `<button onclick="window.loadNextPage(${pagination.current_page + 1})" class="pagination-btn">Siguiente &raquo;</button>` 
                    : ''}
            </div>
        `;
    }

    async function handleTaskSubmit(e) {
        e.preventDefault();

        // Validación del lado del cliente
        const titulo = document.getElementById('titulo').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const estado = document.getElementById('estado').value;
        const prioridad = document.getElementById('prioridad').value;
        const fechaVencimiento = document.getElementById('fecha_vencimiento').value;

        // Validar campos requeridos
        if (!titulo) {
            showError('El título es obligatorio');
            document.getElementById('titulo').focus();
            return;
        }

        if (!descripcion) {
            showError('La descripción es obligatoria');
            document.getElementById('descripcion').focus();
            return;
        }

        if (!estado) {
            showError('Debe seleccionar un estado');
            document.getElementById('estado').focus();
            return;
        }

        if (!prioridad) {
            showError('Debe seleccionar una prioridad');
            document.getElementById('prioridad').focus();
            return;
        }

        // Validar fecha de vencimiento si está presente
        if (fechaVencimiento) {
            const fechaSeleccionada = new Date(fechaVencimiento);
            const ahora = new Date();

            if (fechaSeleccionada < ahora) {
                showError('La fecha de vencimiento no puede ser anterior a la fecha actual');
                document.getElementById('fecha_vencimiento').focus();
                return;
            }
        }

        const taskId = document.getElementById('task-id').value;
        const taskData = {
            titulo: titulo,
            descripcion: descripcion,
            estado: estado,
            prioridad: prioridad,
            fecha_vencimiento: fechaVencimiento || null
        };

        try {
            if (taskId) {
                await updateTask(taskId, taskData);
            } else {
                await createTask(taskData);
            }

            hideModal();
            loadTasks();
        } catch (error) {
            console.error('Error:', error);
            showError('Error al guardar la tarea');
        }
    }

    async function createTask(taskData) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Error al crear la tarea');
        return response.json();
    }

    async function updateTask(taskId, taskData) {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Error al actualizar la tarea');
        return response.json();
    }

    async function deleteTask(taskId) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Error al eliminar la tarea');
            await loadTasks();
        } catch (error) {
            console.error('Error:', error);
            showError('Error al eliminar la tarea');
        }
    }

    // Funciones de UI
    showNewTaskModalFunction = function() {
        taskForm.reset();
        document.getElementById('task-id').value = '';
        document.getElementById('modal-title').textContent = 'Nueva Tarea';
        taskModal.style.display = 'block';
    }

    async function showDeleteConfirmation(taskId) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`);
            if (!response.ok) throw new Error('Error al obtener la tarea');
            
            const task = await response.json();
            document.getElementById('confirm-message').textContent = 
                `¿Desea eliminar la tarea "${task.titulo}"?`;
            
            taskToDelete = taskId;
            confirmModal.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            showError('Error al cargar la tarea');
        }
    }

    // Hacer global para poder llamarla desde el HTML
    window.showEditTaskModal = async function(taskId) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`);
            if (!response.ok) throw new Error('Error al obtener la tarea');
            
            const task = await response.json();
            
            document.getElementById('task-id').value = task.id || '';
            document.getElementById('titulo').value = task.titulo || '';
            document.getElementById('descripcion').value = task.descripcion || '';
            document.getElementById('estado').value = task.estado || 'pendiente';
            document.getElementById('prioridad').value = task.prioridad || 'baja';
            
            if (task.fecha_vencimiento) {
                const fecha = new Date(task.fecha_vencimiento);
                const formatoFecha = fecha.toISOString().slice(0, 16);
                document.getElementById('fecha_vencimiento').value = formatoFecha;
            } else {
                document.getElementById('fecha_vencimiento').value = '';
            }
                
            document.getElementById('modal-title').textContent = 'Editar Tarea';
            taskModal.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            showError('Error al cargar la tarea');
        }
    }

    hideModalFunction = function() {
        taskModal.style.display = 'none';
        taskForm.reset();
    }

    // Funciones de formateo
    function formatDate(dateString) {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatStatus(status) {
        const statusMap = {
            'pendiente': 'Pendiente',
            'en_progreso': 'En Progreso',
            'completada': 'Completada'
        };
        return statusMap[status] || status;
    }

    function formatPriority(priority) {
        const priorityMap = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta'
        };
        return priorityMap[priority] || priority;
    }

    function showError(message) {
        alert(message);
    }

    // Función para limpiar filtros
    function clearFilters() {
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (priorityFilter) priorityFilter.value = '';
        if (itemsPerPageSelect) itemsPerPageSelect.value = '5';
        itemsPerPage = 5;
        currentPage = 1;
        loadTasksInternalFunction(currentPage);
    }

    // Hacer global showDeleteConfirmation para poder llamarla desde el HTML
    window.showDeleteConfirmation = showDeleteConfirmation;
});