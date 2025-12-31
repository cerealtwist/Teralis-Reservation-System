document.addEventListener("DOMContentLoaded", function() {
    fetchUserReservations();
});

async function fetchUserReservations() {
    try {
        // Memanggil API yang sudah Anda buat di ReservationController.java
        const res = await fetch('/WebContent/api/reservations');
        const list = await res.json();

        const upcomingContainer = document.getElementById('upcoming-list');
        const historyContainer = document.getElementById('history-list');

        list.forEach(item => {
            const card = createReservationItem(item);
            // Pisahkan berdasarkan status atau tanggal
            if (item.status === 'pending' || item.status === 'approved') {
                upcomingContainer.appendChild(card);
            } else {
                historyContainer.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Gagal memuat status:", err);
    }
}

function createReservationItem(item) {
    const div = document.createElement('div');
    div.className = 'reservation-item';
    div.innerHTML = `
        <div class="d-flex gap-3 align-items-center">
            <img src="assets/img/${item.roomImage || 'default.png'}" class="thumb">
            <div>
                <small class="text-muted">${item.date} ${item.startTime.substring(0,5)}</small>
                <div class="fw-bold">${item.roomName}</div>
                <small class="text-muted">${item.buildingName}</small>
            </div>
        </div>
    `;

    div.onclick = () => {
        document.querySelectorAll('.reservation-item').forEach(i => i.classList.remove('active'));
        div.classList.add('active');
        showDetail(item);
    };

    return div;
}

async function cancelReservation(id) {
    // Validasi objektif: Pastikan user benar-benar ingin membatalkan
    if (!confirm("Apakah Anda yakin ingin membatalkan reservasi ini?")) return;

    try {
        const res = await fetch(`/WebContent/api/reservations/${id}`, {
            method: 'DELETE'
        });

        const result = await res.json();

        if (res.ok) {
            alert("Reservasi berhasil dibatalkan.");
            // Refresh halaman agar daftar terupdate
            window.location.reload();
        } else {
            alert("Gagal membatalkan: " + result.message);
        }
    } catch (err) {
        console.error("Error cancel:", err);
        alert("Terjadi kesalahan koneksi.");
    }
}

function showDetail(item) {
    const detailCard = document.getElementById('detail-card');
    const emptyState = document.getElementById('empty-state');
    
    emptyState.style.display = 'none';
    detailCard.style.display = 'block';

    const statusBadge = item.status === 'pending' ? 'bg-warning' : (item.status === 'approved' ? 'bg-success' : 'bg-danger');
    const statusText = item.status === 'pending' ? 'Menunggu' : (item.status === 'approved' ? 'Disetujui' : 'Ditolak');

    detailCard.innerHTML = `
        <h2 class="fw-bold mb-4">${item.date} at ${item.startTime.substring(0,5)}</h2>
        <span class="badge ${statusBadge} px-3 py-2 rounded-pill mb-4">${statusText}</span>
        
        <div class="d-flex justify-content-between align-items-start mb-4">
            <div class="d-flex gap-4">
                <img src="assets/img/${item.roomImage || 'default.png'}" width="120" class="rounded-4 shadow-sm">
                <div>
                    <h4 class="fw-bold mb-1">${item.roomName}</h4>
                    <p class="text-muted mb-1">${item.buildingName}</p>
                    <small class="text-muted">ID Reservasi #: ${item.id.toString().padStart(6, '0')}</small>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-light rounded-3 p-3 text-center"><img src="assets/icons/calendar.svg" width="20"><br><small>Reschedule</small></button>
                <button class="btn btn-light rounded-3 p-3 text-center text-danger" onclick="cancelReservation(${item.id})">
                    <img src="assets/icons/cancel.svg" width="20"><br><small>Cancel</small>
                </button>
            </div>
        </div>

        <div class="p-4 bg-light rounded-4 mb-4">
            <h6 class="fw-bold mb-3">Kegiatan: ${item.reason}</h6>
            <p class="mb-0 text-muted">${item.startTime.substring(0,5)} - ${item.endTime.substring(0,5)}</p>
        </div>

        <div class="small text-muted border-top pt-3">
            <strong>Cancellation policy</strong><br>
            Pembatalan dapat dilakukan maksimal 24 jam sebelum waktu pemakaian.
        </div>
    `;
}