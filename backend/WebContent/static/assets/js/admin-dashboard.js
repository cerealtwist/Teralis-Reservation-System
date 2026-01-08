document.addEventListener("DOMContentLoaded", function() {
    // Muat data reservasi pertama kali
    loadReservations();
    
    // Listener Filter
    document.getElementById('filterStatus')?.addEventListener('change', loadReservations);
    document.getElementById('filterDate')?.addEventListener('change', loadReservations);
    document.getElementById('filterRole')?.addEventListener('change', loadUsers);
});

/**
 * FUNGSI NAVIGASI: Berpindah antar section (SPA style)
 */
function switchView(view) {
    const sections = ['section-reservasi', 'section-users', 'section-rooms'];
    const navs = ['nav-reservasi', 'nav-users', 'nav-rooms'];
    
    sections.forEach(s => document.getElementById(s).classList.remove('active'));
    navs.forEach(n => document.getElementById(n)?.classList.remove('active'));
    
    document.getElementById(`section-${view}`).classList.add('active');
    document.getElementById(`nav-${view}`)?.classList.add('active');

    if (view === 'reservasi') loadReservations();
    else if (view === 'users') loadUsers();
    else if (view === 'rooms') loadRooms();
}

// --- CRUD RUANGAN ---

/**
 * LOAD ROOMS: Mengambil daftar ruangan untuk tabel admin
 */
async function loadRooms() {
    const tbody = document.getElementById('room-list');
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Memuat data ruangan...</td></tr>`;
    try {
        const res = await fetch('../api/rooms');
        const rooms = await res.json();
        tbody.innerHTML = "";

        // 1. Deteksi nama project otomatis dari URL browser
        const pathArray = window.location.pathname.split('/');
        const contextPath = pathArray[1] ? `/${pathArray[1]}` : "";
        
        // 2. Path Gambar Default (Static Assets)
        const defaultImage = `${contextPath}/static/assets/img/telu-building.png`;

        rooms.forEach(r => {
            // 3. Tentukan Source: Jika ada upload ke /images/, jika tidak ke default
            const imageSource = r.imageUrl 
                ? `${contextPath}/images/${r.imageUrl}` 
                : defaultImage;

            tbody.innerHTML += `
                <tr>
                    <td>
                        <img src="${imageSource}" 
                             class="img-preview-table" 
                             style="width: 80px; height: 50px; object-fit: cover; border-radius: 6px;"
                             onerror="this.onerror=null;this.src='${defaultImage}';">
                    </td>
                    <td>
                        <div class="fw-bold">${r.name}</div>
                        <small class="text-muted">${r.type || 'General'}</small>
                    </td>
                    <td>${r.buildingName || '-'}</td>
                    <td>${r.capacity} Orang</td>
                    <td>
                        <button class="btn btn-sm btn-light-primary" onclick="editRoom(${r.id})" title="Edit"><i class="ti ti-edit"></i></button>
                        <button class="btn btn-sm btn-light-danger" onclick="deleteRoom(${r.id})" title="Hapus"><i class="ti ti-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (err) { 
        console.error(err); 
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat data.</td></tr>`;
    }
}

/**
 * OPEN MODAL: Reset form dan siapkan modal tambah/edit
 */
async function openRoomModal() {
    const form = document.getElementById('roomForm');
    form.reset();
    document.getElementById('room-id').value = "";
    document.getElementById('roomModalTitle').innerText = "Tambah Ruangan";
    
    // Reset preview gambar jika ada elemennya (opsional, menjaga agar tidak ada sisa gambar lama)
    const previewImg = document.getElementById('preview-image'); // Pastikan ID ini ada di HTML modal jika ingin fitur ini
    if(previewImg) previewImg.src = "";

    await loadBuildingOptions();
    new bootstrap.Modal(document.getElementById('roomModal')).show();
}

/**
 * LOAD BUILDINGS: Mengambil opsi gedung untuk dropdown
 */
async function loadBuildingOptions() {
    try {
        const res = await fetch('../api/buildings');
        const buildings = await res.json();
        const select = document.getElementById('room-building');
        select.innerHTML = buildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    } catch (err) { console.error("Gagal memuat gedung:", err); }
}

/**
 * FUNGSI SIMPAN RUANGAN (MULTIPART POST)
 */
document.getElementById('roomForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const id = document.getElementById('room-id').value;

    // Menambahkan field dasar
    formData.append("name", document.getElementById('room-name').value);
    formData.append("buildingId", document.getElementById('room-building').value);
    formData.append("capacity", document.getElementById('room-capacity').value);
    
    // MENAMBAHKAN FIELD BARU (Type, Facilities, Status)
    formData.append("type", document.getElementById('room-type').value);
    formData.append("facilities", document.getElementById('room-facilities').value);
    formData.append("status", document.getElementById('room-status').value);
    
    // Menambahkan file gambar jika ada
    const fileInput = document.getElementById('room-image');
    if (fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
    }

    // Jika ada ID, arahkan ke endpoint update, jika tidak maka create
    const url = id ? `../api/rooms/update?id=${id}` : `../api/rooms`;

    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        if (res.ok) {
            alert("Data ruangan berhasil disimpan!");
            const modalEl = document.getElementById('roomModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            loadRooms();
        } else {
            const errData = await res.json();
            alert("Gagal: " + (errData.message || "Terjadi kesalahan server"));
        }
    } catch (err) { 
        console.error(err);
        alert("Gagal menghubungi server."); 
    }
};

/**
 * EDIT ROOM: Mengambil detail ruangan dan mengisi modal
 */
async function editRoom(id) {
    try {
        const res = await fetch(`../api/rooms/${id}`);
        if (!res.ok) throw new Error("Ruangan tidak ditemukan");
        
        const r = await res.json();
        
        document.getElementById('roomModalTitle').innerText = "Edit Ruangan";
        document.getElementById('room-id').value = r.id;
        document.getElementById('room-name').value = r.name;
        document.getElementById('room-capacity').value = r.capacity;
        
        // MENGISI FIELD BARU KE MODAL
        document.getElementById('room-type').value = r.type || "";
        document.getElementById('room-facilities').value = r.facilities || "";
        document.getElementById('room-status').value = r.status || "available";
        
        await loadBuildingOptions();
        document.getElementById('room-building').value = r.buildingId;
        
        new bootstrap.Modal(document.getElementById('roomModal')).show();
    } catch (err) {
        console.error(err);
        alert("Gagal mengambil data detail ruangan.");
    }
}

/**
 * DELETE ROOM
 */
async function deleteRoom(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus ruangan ini secara permanen?")) return;
    try {
        const res = await fetch(`../api/rooms/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Ruangan berhasil dihapus.");
            loadRooms();
        }
    } catch (err) { console.error(err); }
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
                    <td>
                        <div class="fw-bold">${item.userName || 'Anonymous'}</div>
                        <small class="text-muted">${item.userRole || 'Student'}</small>
                    </td>
                    <td>${item.roomName || 'N/A'}</td>
                    <td>
                        <div>${item.date}</div>
                        <small class="text-muted">${sTime} - ${eTime}</small>
                    </td>
                    <td>
                        ${item.documentPath ? 
                            `<a href="../uploads/${item.documentPath}" target="_blank" class="btn btn-sm btn-light-danger">
                                <i class="ti ti-file-text"></i> Lihat Surat
                             </a>` : '<span class="text-muted small">No File</span>'}
                    </td>
                    <td><span class="badge ${getStatusClass(item.status)}">${item.status.toUpperCase()}</span></td>
                    <td>
                        ${item.status === 'pending' ? `
                            <button onclick="updateStatus(${item.id}, 'approved')" class="btn btn-sm btn-success" title="Setujui"><i class="ti ti-check"></i></button>
                            <button onclick="updateStatus(${item.id}, 'rejected')" class="btn btn-sm btn-danger" title="Tolak"><i class="ti ti-x"></i></button>
                        ` : '<i class="ti ti-circle-check text-muted"></i> Selesai'}
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
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">User tidak ditemukan.</td></tr>`;
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
                        <button class="btn btn-sm btn-light-danger" onclick="deleteUser(${user.id})" title="Hapus"><i class="ti ti-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-warning">${err.message}</td></tr>`; }
}

/**
 * HELPERS: Warna Status & Role
 */
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

/**
 * UPDATE RESERVATION STATUS (Approve/Reject)
 */
async function updateStatus(id, newStatus) {
    if (!confirm(`Ubah status reservasi menjadi ${newStatus.toUpperCase()}?`)) return;
    try {
        const res = await fetch(`../api/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) { 
            alert("Status diperbarui!"); 
            loadReservations(); 
        }
    } catch (err) { alert("Gagal update status ke server."); }
}