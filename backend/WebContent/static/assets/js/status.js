document.addEventListener("DOMContentLoaded", () => {
    loadUserReservations();
});

// === KONFIGURASI PATH (SAMA DENGAN ROOM.JS) ===
const contextPath = "/WebContent"; 
const defaultImage = `${contextPath}/static/assets/img/telu-building.png`;

let allReservations = [];

async function loadUserReservations() {
    try {
        // Mengambil data reservasi milik user yang sedang login
        const res = await fetch(`${contextPath}/api/reservations/my`); 
        
        if (!res.ok) throw new Error("Gagal mengambil data reservasi");

        allReservations = await res.json();
        renderLists(allReservations);
        
    } catch (err) {
        console.error(err);
        const upcomingContainer = document.getElementById("upcoming-list");
        if(upcomingContainer) upcomingContainer.innerHTML = `<p class="text-danger small text-center">Gagal memuat data reservasi.</p>`;
    }
}

function renderLists(data) {
    const upcomingContainer = document.getElementById("upcoming-list");
    const historyContainer = document.getElementById("history-list");
    
    if (upcomingContainer) upcomingContainer.innerHTML = "";
    if (historyContainer) historyContainer.innerHTML = "";

    const now = new Date(); 

    // Urutkan: Terbaru paling atas
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    let hasUpcoming = false;
    let hasHistory = false;

    data.forEach(item => {
        const itemDateTime = new Date(`${item.date}T${item.endTime}`);
        const isHistory = itemDateTime < now || item.status === 'rejected' || item.status === 'cancelled';

        // --- LOGIKA GAMBAR (SAMA DENGAN ROOM.JS) ---
        // Jika item.roomImage ada, pakai /images/ (External). Jika tidak, pakai default.
        const imageSource = item.roomImage 
            ? `${contextPath}/images/${item.roomImage}` 
            : defaultImage;

        const cardHTML = `
            <div class="card-status p-3 mb-2 bg-white rounded-3 border shadow-sm" 
                 onclick="showDetail(${item.id})" 
                 style="cursor: pointer; transition: all 0.2s;">
                <div class="d-flex gap-3 align-items-center">
                    <img src="${imageSource}" 
                         class="rounded-3" 
                         width="70" height="70" 
                         style="object-fit: cover;"
                         onerror="if(this.src !== '${defaultImage}') { this.onerror=null; this.src='${defaultImage}'; }">
                    
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="fw-bold mb-0 text-truncate">${item.roomName || 'Ruangan'}</h6>
                            ${getStatusBadge(item.status)}
                        </div>
                        <p class="text-muted small mb-1 text-truncate">${item.buildingName || 'Gedung Teralis'}</p>
                        <div class="d-flex align-items-center gap-2 small text-muted">
                            <img src="${contextPath}/static/assets/icons/calendar.svg" width="12" style="opacity: 0.6">
                            <span>${item.date}</span>
                            <span class="mx-1">•</span>
                            <span>${item.startTime?.substring(0,5)} - ${item.endTime?.substring(0,5)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (isHistory) {
            historyContainer.innerHTML += cardHTML;
            hasHistory = true;
        } else {
            upcomingContainer.innerHTML += cardHTML;
            hasUpcoming = true;
        }
    });

    if (!hasUpcoming) upcomingContainer.innerHTML = `<div class="text-center py-4 text-muted small bg-white rounded-3 border border-dashed">Belum ada reservasi aktif</div>`;
    if (!hasHistory) historyContainer.innerHTML = `<div class="text-center py-4 text-muted small bg-white rounded-3 border border-dashed">Belum ada riwayat</div>`;
}

function showDetail(id) {
    const item = allReservations.find(r => r.id === id);
    if (!item) return;

    const detailCard = document.getElementById("detail-card");
    const emptyState = document.getElementById("empty-state");

    // --- LOGIKA GAMBAR DETAIL ---
    const imageSource = item.roomImage 
        ? `${contextPath}/images/${item.roomImage}` 
        : defaultImage;

    detailCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
                <h2 class="fw-bold mb-1">${item.roomName || 'Detail Ruangan'}</h2>
                <p class="text-muted mb-0">${item.buildingName || 'Gedung Teralis'}</p>
            </div>
            ${getStatusBadge(item.status, true)}
        </div>

        <div class="rounded-4 overflow-hidden mb-4 border" style="height: 250px;">
            <img src="${imageSource}" 
                 class="w-100 h-100" 
                 style="object-fit: cover;"
                 onerror="if(this.src !== '${defaultImage}') { this.onerror=null; this.src='${defaultImage}'; }">
        </div>

        <div class="row g-4 mb-4">
            <div class="col-6">
                <label class="small text-muted fw-bold mb-1">TANGGAL</label>
                <div class="d-flex align-items-center gap-2">
                    <img src="${contextPath}/static/assets/icons/calendar.svg" width="16">
                    <span class="fw-medium">${item.date}</span>
                </div>
            </div>
            <div class="col-6">
                <label class="small text-muted fw-bold mb-1">WAKTU</label>
                <div class="d-flex align-items-center gap-2">
                    <img src="${contextPath}/static/assets/icons/clock.svg" width="16">
                    <span class="fw-medium">${item.startTime?.substring(0,5)} - ${item.endTime?.substring(0,5)} WIB</span>
                </div>
            </div>
            <div class="col-12">
                <label class="small text-muted fw-bold mb-1">KEPERLUAN</label>
                <p class="mb-0 fw-medium text-dark">${item.reason || '-'}</p>
            </div>
            <div class="col-12">
                <label class="small text-muted fw-bold mb-1">DOKUMEN PENDUKUNG</label>
                <div>
                    ${item.documentPath 
                        ? `<a href="${contextPath}/uploads/${item.documentPath}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                             <i class="ti ti-file-text me-1"></i> Lihat Surat Pengajuan
                           </a>` 
                        : '<span class="text-muted fst-italic">Tidak ada dokumen dilampirkan</span>'}
                </div>
            </div>
        </div>

        ${item.status === 'pending' || item.status === 'approved' ? `
            <hr class="my-4 opacity-10">
            <div class="d-flex justify-content-end">
                <button onclick="cancelReservation(${item.id})" class="btn btn-danger rounded-pill px-4 fw-bold">
                    Batalkan Reservasi
                </button>
            </div>
        ` : ''}
    `;

    // Toggle tampilan
    if(emptyState) emptyState.classList.add("d-none");
    if(detailCard) detailCard.classList.remove("d-none");
    
    // Scroll ke detail jika di mobile
    if (window.innerWidth < 768 && detailCard) {
        detailCard.scrollIntoView({ behavior: 'smooth' });
    }
}

async function cancelReservation(id) {
    if (!confirm("Apakah Anda yakin ingin membatalkan reservasi ini?")) return;

    try {
        const res = await fetch(`${contextPath}/api/reservations/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert("Reservasi berhasil dibatalkan.");
            loadUserReservations(); // Reload data
            
            // Reset tampilan kanan
            const detailCard = document.getElementById("detail-card");
            const emptyState = document.getElementById("empty-state");
            if(detailCard) detailCard.classList.add("d-none");
            if(emptyState) emptyState.classList.remove("d-none");
        } else {
            const err = await res.json();
            alert("Gagal membatalkan: " + (err.message || "Error server"));
        }
    } catch (e) {
        alert("Gagal menghubungi server");
    }
}

function getStatusBadge(status, isLarge = false) {
    let colorClass = "";
    let label = "";
    let icon = "";

    switch (status) {
        case 'pending':
            colorClass = "bg-warning text-dark bg-opacity-25 text-warning-emphasis border-warning";
            label = "Menunggu Konfirmasi";
            break;
        case 'approved':
            colorClass = "bg-success text-success bg-opacity-10 border-success";
            label = "Disetujui";
            break;
        case 'rejected':
            colorClass = "bg-danger text-danger bg-opacity-10 border-danger";
            label = "Ditolak";
            break;
        case 'cancelled':
            colorClass = "bg-secondary text-secondary bg-opacity-10 border-secondary";
            label = "Dibatalkan";
            break;
        default:
            colorClass = "bg-light text-muted border";
            label = status;
    }

    const sizeClass = isLarge ? "px-3 py-2 rounded-pill border" : "badge rounded-pill border";
    
    return `<span class="${sizeClass} ${colorClass} d-inline-flex align-items-center gap-1">
                ${icon} ${label.toUpperCase()}
            </span>`;
}