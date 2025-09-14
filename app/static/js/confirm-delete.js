// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Configurar event listeners para el modal de confirmación
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    
    confirmYesBtn.addEventListener('click', async () => {
        try {
            const taskId = confirmYesBtn.getAttribute('data-task-id');
            if (taskId) {
                await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                });
                loadTasks();
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error al eliminar la tarea');
        }
        confirmModal.style.display = 'none';
    });
    
    confirmNoBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
    });
});

// Función para mostrar el modal de confirmación
async function showDeleteConfirmation(taskId) {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        const task = await response.json();
        document.getElementById('confirm-message').textContent = `¿Desea eliminar la tarea "${task.titulo}"?`;
        confirmYesBtn.setAttribute('data-task-id', taskId);
        confirmModal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showError('Error al preparar la eliminación');
    }
}