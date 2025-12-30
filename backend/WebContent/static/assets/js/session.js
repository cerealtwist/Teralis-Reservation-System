const CONTEXT_PATH = '/WebContent'; 

document.addEventListener("DOMContentLoaded", function() {
    updateNavbarUI();
});

// 1. Fungsi untuk mengatur tampilan Navbar (Login vs Logout)
function updateNavbarUI() {
    fetch(`${CONTEXT_PATH}/api/auth/status`, { credentials: "include" })
        .then(response => {
            const loginBtn = document.getElementById('login-nav-btn');
            const logoutBtn = document.getElementById('logout-nav-btn');
            // Ambil elemen tombol Reservasi di Hero
            const reservasiBtn = document.getElementById('hero-reservasi-btn');
            const currentPath = window.location.pathname;

            if (response.ok) {
                // --- USER SUDAH LOGIN ---
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'block';
                
                // LOGIc: Jika sudah login, arahkan ke room.html
                if (reservasiBtn) {
                    reservasiBtn.href = "room.html";
                }

                if (currentPath.endsWith("login.html")) {
                    window.location.href = "index.html";
                }
            } else {
                // --- USER BELUM LOGIN ---
                if (loginBtn) loginBtn.style.display = 'block';
                if (logoutBtn) logoutBtn.style.display = 'none';
                
                // Kembalikan ke login.html jika belum login
                if (reservasiBtn) {
                    reservasiBtn.href = "login.html";
                }
            }
        })
        .catch(err => console.error("Session sync failed:", err));
}

// 2. Fungsi untuk Proteksi Halaman
function checkSession(allowedRoles) {
    fetch(`${CONTEXT_PATH}/api/auth/status`)
        .then(res => {
            if (!res.ok) {
                window.location.href = "login.html";
                return;
            }
            return res.json();
        })
        .then(data => {
            if (data && !allowedRoles.includes(data.role)) {
                alert("Akses Ditolak!");
                window.location.href = "index.html";
            }
        });
}

// 3. Fungsi Logout
function handleLogout() {
    fetch(`${CONTEXT_PATH}/api/auth/logout`)
        .then(() => {
            window.location.href = "index.html";
        })
        .catch(err => console.error("Logout failed:", err));
}