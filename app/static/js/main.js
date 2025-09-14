// URLs de la API
const API_URL = '/api/tasks';

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const taskContainer = document.getElementById('tasks-container');
    const taskModal = document.getElementById('task-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const taskForm = document.getElementById('task-form');
    const closeModal = document.querySelector('.close');
    const newTaskBtn = document.getElementById('new-task-btn');
    const filterBtn = document.getElementById('filter-btn');
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    
    let taskToDelete = null;

    // Event Listeners
    if (newTaskBtn) newTaskBtn.addEventListener('click', showNewTaskModal);
    if (closeModal) closeModal.addEventListener('click', hideModal);
    if (taskForm) taskForm.addEventListener('submit', handleTaskSubmit);
    if (filterBtn) filterBtn.addEventListener('click', loadTasks);
    
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

    // Funciones principales
    async function loadTasks() {
        try {
            const estado = statusFilter.value;
            const prioridad = priorityFilter.value;
            let url = API_URL;
            
            // Agregar parámetros de filtro si existen
            const params = new URLSearchParams();
            if (estado) params.append('estado', estado);
            if (prioridad) params.append('prioridad', prioridad);
            if (params.toString()) url += '?' + params.toString();
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar las tareas');
            
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error:', error);
            showError('Error al cargar las tareas');
        }
    }

    function renderTasks(tasks) {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            taskContainer.innerHTML = '<p class="no-tasks">No hay tareas que mostrar</p>';
            return;
        }

        taskContainer.innerHTML = tasks.map(task => `
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
    }

    async function handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const taskData = {
            titulo: document.getElementById('titulo').value,
            descripcion: document.getElementById('descripcion').value,
            estado: document.getElementById('estado').value,
            prioridad: document.getElementById('prioridad').value,
            fecha_vencimiento: document.getElementById('fecha_vencimiento').value || null
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
    function showNewTaskModal() {
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

    function hideModal() {
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

    // Hacer global showDeleteConfirmation para poder llamarla desde el HTML
    window.showDeleteConfirmation = showDeleteConfirmation;
});