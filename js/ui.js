// UI Utilities
const UI = {
    // Escape user-controlled text before interpolating it into innerHTML templates.
    esc: (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    )),

    showToast: (message, type = 'success') => {
        // Create container if not exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        // Create Toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;

        // Add to container
        container.appendChild(toast);

        // Animate In
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    confirm: (message) => {
        return window.confirm(message); // Native confirm kept deliberately - it blocks execution, which callers rely on
    }
};
