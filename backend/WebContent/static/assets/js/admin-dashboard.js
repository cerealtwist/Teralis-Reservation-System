document.addEventListener("DOMContentLoaded", function() {
    loadReservations();

    // Event Filter
    document.getElementById('filterStatus').addEventListener('change', loadReservations);
});

async function loadReservations() {
    const filter = document.getElementById('filterStatus').value;
    try {
        const res = await fetch('api/reservations'); // Panggil API yang sudah ada
        const data = await res.json();
        
        const tbody = document.getElementById('reservation-list');
        tbody.innerHTML = "";

        data.forEach(item => {
            // Logika Filter
            if (filter && item.status !== filter) return;

            const row = `
                <tr>
                    <td>
                        <div class="fw-bold">${item.userName}</div>
                        <small class="text-muted">${item.userRole}</small>
                    </td>
                    <td>${item.roomName}</td>
                    <td>
                        <div>${item.date}</div>
                        <small>${item.startTime.substring(0,5)} - ${item.endTime.substring(0,5)}</small>
                    </td>
                    <td>
                        ${item.documentPath ? 
                            `<a href="uploads/${item.documentPath}" target="_blank" class="btn btn-sm btn-light-danger">
                                <i class="ti ti-file-text"></i> Lihat Surat
                             </a>` : '<span class="text-muted">No File</span>'}
                    </td>
                    <td>
                        <span class="badge ${getStatusClass(item.status)}">${item.status.toUpperCase()}</span>
                    </td>
                    <td>
                        ${item.status === 'pending' ? `
                            <button onclick="updateStatus(${item.id}, 'approved')" class="btn btn-sm btn-success"><i class="ti ti-check"></i></button>
                            <button onclick="updateStatus(${item.id}, 'rejected')" class="btn btn-sm btn-danger"><i class="ti ti-x"></i></button>
                        ` : '<i class="ti ti-circle-check text-muted"></i> Selesai'}
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (err) { console.error("Load error:", err); }
}

function getStatusClass(status) {
    if (status === 'pending') return 'bg-warning';
    if (status === 'approved') return 'bg-success';
    return 'bg-danger';
}

async function updateStatus(id, newStatus) {
    if (!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
        const res = await fetch(`api/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert("Status berhasil diperbarui!");
            loadReservations();
        }
    } catch (err) { alert("Gagal update"); }
}