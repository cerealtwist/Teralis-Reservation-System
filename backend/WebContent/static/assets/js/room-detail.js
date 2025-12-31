document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('id');

    if (!roomId) return window.location.href = "room.html";

    // 1. Fetch Detail Ruangan
    fetch(`/WebContent/api/rooms/${roomId}`)
        .then(res => res.json())
        .then(room => {
            // Mapping Data Dasar
            document.getElementById('room-name').textContent = room.name;
            document.getElementById('room-building').textContent = room.buildingName;
            document.getElementById('room-capacity').textContent = `${room.capacity} Orang`;
            
            // Breadcrumb Logic
            document.getElementById('breadcrumb-building-link').textContent = room.buildingName;
            document.getElementById('breadcrumb-room-active').textContent = room.name;

            // Image Gallery (Main Image)
            const imgPath = room.imageUrl ? `assets/img/${room.imageUrl}` : 'assets/img/telu-building.png';
            document.getElementById('img-main').src = imgPath;

            // Link Reservasi
            document.getElementById('btn-reservasi').href = `reservation.html?room_id=${room.id}`;
        })
        .catch(err => {
            console.error("Error Detail:", err);
            alert("Gagal memuat detail ruangan.");
        });
});

function renderCalendarGrid() {
    const grid = document.getElementById('calendar-grid');
    const startTime = 7;  // 07:00
    const endTime = 21;   // 21:00

    for (let hour = startTime; hour <= endTime; hour++) {
        const timeStr = hour.toString().padStart(2, '0') + ':00';
        
        // Label Waktu (Kolom 1)
        const label = document.createElement('div');
        label.className = 'time-slot-label';
        label.textContent = timeStr;
        grid.appendChild(label);

        // Cell Kosong untuk 7 hari (Kolom 2 - 8)
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            // CONTOH: Menambahkan Reservasi Farand pada hari Minggu (day 0) jam 09:00
            if (day === 0 && hour === 9) {
                cell.innerHTML = `
                    <div class="event-card-green shadow-sm" style="height: calc(300% - 8px);">
                        <strong>Farand (3 jam)</strong>
                        <small class="d-block opacity-75">Mahasiswa</small>
                        <hr class="my-1 opacity-25">
                        <p class="mb-0">Pelantikan Sistem Energi</p>
                    </div>
                `;
            }
            
            grid.appendChild(cell);
        }
    }
}

renderCalendarGrid();