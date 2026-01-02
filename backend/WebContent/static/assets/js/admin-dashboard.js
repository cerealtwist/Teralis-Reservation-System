document.addEventListener("DOMContentLoaded", function() {
    loadReservations();

    // Event Filter
    const filterEl = document.getElementById('filterStatus');
    if (filterEl) {
        filterEl.addEventListener('change', loadReservations);
    }
});

async function loadReservations() {
    const filter = document.getElementById('filterStatus').value;
    try {
        // PERBAIKAN: Pastikan path ke API benar (naik satu tingkat dari folder static)
        const res = await fetch('../api/reservations'); 
        
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        
        const data = await res.json();
        const tbody = document.getElementById('reservation-list');
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada data reservasi.</td></tr>`;
            return;
        }

        data.forEach(item => {
            // Logika Filter
            if (filter && item.status !== filter) return;

            // SAFETEY CHECK: Mencegah crash jika data waktu null
            const sTime = item.startTime ? item.startTime.substring(0,5) : "--:--";
            const eTime = item.endTime ? item.endTime.substring(0,5) : "--:--";

            const row = `
                <tr>
                    <td>
                        <div class="fw-bold">${item.userName || 'Anonymous'}</div>
                        <small class="text-muted">${item.userRole || 'Student'}</small>
                    </td>
                    <td>${item.roomName || 'Ruangan Terhapus'}</td>
                    <td>
                        <div>${item.date}</div>
                        <small class="text-muted">${sTime} - ${eTime}</small>
                    </td>
                    <td>
                        ${item.documentPath ? 
                            `<a href="../uploads/${item.documentPath}" target="_blank" class="btn btn-sm btn-light-danger">
                                <i class="ti ti-file-text"></i> Lihat Surat
                             </a>` : '<span class="text-muted small">Tanpa Dokumen</span>'}
                    </td>
                    <td>
                        <span class="badge ${getStatusClass(item.status)}">${item.status ? item.status.toUpperCase() : 'PENDING'}</span>
                    </td>
                    <td>
                        ${item.status === 'pending' ? `
                            <div class="d-flex gap-2">
                                <button onclick="updateStatus(${item.id}, 'approved')" class="btn btn-sm btn-success" title="Setujui">
                                    <i class="ti ti-check"></i>
                                </button>
                                <button onclick="updateStatus(${item.id}, 'rejected')" class="btn btn-sm btn-danger" title="Tolak">
                                    <i class="ti ti-x"></i>
                                </button>
                            </div>
                        ` : '<span class="text-muted small"><i class="ti ti-circle-check"></i> Selesai</span>'}
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) { 
        console.error("Load error:", err);
        document.getElementById('reservation-list').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${err.message}</td></tr>`;
    }
}

function getStatusClass(status) {
    // Sesuai dengan Design System: Kuning untuk proses, Hijau untuk sukses, Merah untuk batal
    if (status === 'pending') return 'bg-warning text-dark';
    if (status === 'approved') return 'bg-success';
    if (status === 'rejected' || status === 'cancelled') return 'bg-danger';
    return 'bg-secondary';
}

async function updateStatus(id, newStatus) {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
        const res = await fetch(`../api/reservations/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json' // Sangat penting agar server tahu ini JSON
            },
            body: JSON.stringify({ status: newStatus }) // Key "status" harus kecil, sesuai Java
        });

        // Baca respon JSON dari server
        const result = await res.json();

        if (res.ok) {
            alert("Status berhasil diperbarui!");
            loadReservations(); // Muat ulang tabel
        } else {
            // Tampilkan pesan error spesifik dari backend (seperti: "ID tidak ditemukan")
            alert("Gagal: " + (result.message || "Terjadi kesalahan"));
        }
    } catch (err) {
        console.error("DEBUG UPDATE ERROR:", err);
        alert("Terjadi kesalahan sistem. Cek Console (F12) untuk detail.");
    }
}