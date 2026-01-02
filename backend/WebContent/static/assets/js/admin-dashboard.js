document.addEventListener("DOMContentLoaded", function() {
    loadReservations();

    // Listener Filter Reservasi
    const filterStatusEl = document.getElementById('filterStatus');
    if (filterStatusEl) filterStatusEl.addEventListener('change', loadReservations);
    
    const filterDateEl = document.getElementById('filterDate');
    if (filterDateEl) filterDateEl.addEventListener('change', loadReservations);

    // Listener Filter Role (User Management)
    const filterRoleEl = document.getElementById('filterRole');
    if (filterRoleEl) {
        filterRoleEl.addEventListener('change', loadUsers);
    }
});

/**
 * FUNGSI NAVIGASI: Berpindah antar section (SPA style)
 */
function switchView(view) {
    const resSection = document.getElementById('section-reservasi');
    const userSection = document.getElementById('section-users');
    const navRes = document.getElementById('nav-reservasi');
    const navUser = document.getElementById('nav-users');

    if (view === 'reservasi') {
        resSection.classList.add('active');
        userSection.classList.remove('active');
        navRes.classList.add('active');
        navUser.classList.remove('active');
        loadReservations();
    } else if (view === 'users') {
        resSection.classList.remove('active');
        userSection.classList.add('active');
        navRes.classList.remove('active');
        navUser.classList.add('active');
        loadUsers();
    }
}

/**
 * LOAD RESERVASI: Fetch + Filter (Status & Date)
 */
async function loadReservations() {
    const filterStatus = document.getElementById('filterStatus').value;
    const filterDate = document.getElementById('filterDate').value;

    try {
        const res = await fetch('../api/reservations'); 
        if (!res.ok) throw new Error("Gagal mengambil data reservasi.");
        
        const data = await res.json();
        const tbody = document.getElementById('reservation-list');
        tbody.innerHTML = "";

        const filteredData = data.filter(item => {
            const matchStatus = !filterStatus || item.status === filterStatus;
            const matchDate = !filterDate || item.date === filterDate;
            return matchStatus && matchDate;
        });

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Data tidak ditemukan.</td></tr>`;
            return;
        }

        filteredData.forEach(item => {
            const sTime = item.startTime ? item.startTime.substring(0,5) : "--:--";
            const eTime = item.endTime ? item.endTime.substring(0,5) : "--:--";

            tbody.innerHTML += `
                <tr>
                    <td><div class="fw-bold">${item.userName || 'Anonymous'}</div><small class="text-muted">${item.userRole || 'Student'}</small></td>
                    <td>${item.roomName || 'N/A'}</td>
                    <td><div>${item.date}</div><small class="text-muted">${sTime} - ${eTime}</small></td>
                    <td>${item.documentPath ? `<a href="../uploads/${item.documentPath}" target="_blank" class="btn btn-sm btn-light-danger"><i class="ti ti-file-text"></i> Lihat Surat</a>` : '<span class="text-muted small">No File</span>'}</td>
                    <td><span class="badge ${getStatusClass(item.status)}">${item.status.toUpperCase()}</span></td>
                    <td>
                        ${item.status === 'pending' ? `
                            <button onclick="updateStatus(${item.id}, 'approved')" class="btn btn-sm btn-success"><i class="ti ti-check"></i></button>
                            <button onclick="updateStatus(${item.id}, 'rejected')" class="btn btn-sm btn-danger"><i class="ti ti-x"></i></button>
                        ` : '<i class="ti ti-circle-check text-muted"></i>'}
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

/**
 * LOAD USERS: Fetch + Filter Role
 */
async function loadUsers() {
    const filterRole = document.getElementById('filterRole').value;
    const tbody = document.getElementById('user-list');
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3">Memuat user...</td></tr>`;

    try {
        const res = await fetch('../api/users'); 
        if (!res.ok) throw new Error("Akses API User ditolak.");

        const users = await res.json();
        tbody.innerHTML = "";

        const filteredUsers = users.filter(user => !filterRole || user.role === filterRole);

        if (filteredUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">User dengan role "${filterRole}" tidak ditemukan.</td></tr>`;
            return;
        }

        filteredUsers.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td><div class="fw-bold">${user.name}</div></td>
                    <td>${user.email}</td>
                    <td><span class="badge ${getRoleClass(user.role)}">${user.role.toUpperCase()}</span></td>
                    <td>
                        <button class="btn btn-sm btn-light-danger" onclick="deleteUser(${user.id})"><i class="ti ti-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-warning">${err.message}</td></tr>`; }
}

function getStatusClass(status) {
    if (status === 'pending') return 'bg-warning text-dark';
    if (status === 'approved') return 'bg-success';
    return 'bg-danger';
}

function getRoleClass(role) {
    if (role === 'admin') return 'bg-light-danger text-danger';
    if (role === 'lecturer') return 'bg-light-success text-success';
    return 'bg-light-primary text-primary';
}

async function updateStatus(id, newStatus) {
    if (!confirm(`Ubah status ke ${newStatus}?`)) return;
    try {
        const res = await fetch(`../api/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) { alert("Sukses!"); loadReservations(); }
    } catch (err) { alert("Gagal update server."); }
}