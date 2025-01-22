class Auth {
    static checkAuth() {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            window.location.href = '/admin/login.html';
        }
    }

    static logout() {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login.html';
    }
} 