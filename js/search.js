document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const systemName = document.getElementById('system-name').value.trim();
    if (systemName) {
        window.location.href = `system.html?system_name=${encodeURIComponent(systemName)}`;
    }
});