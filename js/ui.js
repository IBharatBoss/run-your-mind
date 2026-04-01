let toastStack = null;

function ensureToastStack() {
    if (toastStack) return toastStack;

    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    toastStack.setAttribute('aria-live', 'polite');
    toastStack.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastStack);

    return toastStack;
}

export function showToast(message, type = 'info', duration = 2800) {
    if (!message) return;

    const host = ensureToastStack();
    const toast = document.createElement('div');
    toast.className = `app-toast toast-${type}`;
    toast.textContent = message;

    host.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });

    window.setTimeout(() => {
        toast.classList.remove('is-visible');
        window.setTimeout(() => {
            toast.remove();
        }, 220);
    }, duration);
}
