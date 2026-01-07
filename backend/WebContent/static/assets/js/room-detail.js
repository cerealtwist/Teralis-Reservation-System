// STATE KALENDER
let currentViewDate = new Date(); 
let currentViewMode = 'week';
window.CONTEXT_PATH = window.CONTEXT_PATH || '/WebContent';

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('id');

    if (!roomId) return window.location.href = "room.html";

    initCalendarListeners(roomId);

    // Gunakan path relatif agar konsisten dengan halaman lain
    fetch(`${CONTEXT_PATH}/api/rooms/${roomId}`)
        .then(res => res.json())
        .then(room => {
            renderRoomInfo(room);
            updateCalendarDisplay(roomId);
        })
        .catch(err => console.error("Error Detail:", err));
});

// HELPER: Fungsi untuk format tanggal YYYY-MM-DD berdasarkan waktu lokal (bukan UTC)
function formatDateLocal(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderRoomInfo(room) {
    document.getElementById('room-name').textContent = room.name;
    document.getElementById('room-building').textContent = room.buildingName;
    document.getElementById('room-capacity').textContent = `${room.capacity} Orang`;
    document.getElementById('breadcrumb-building-link').textContent = room.buildingName;
    document.getElementById('breadcrumb-room-active').textContent = room.name;
    
    // === PERBAIKAN PATH ===
    // Path Default Image (Static)
    const defaultImg = `${window.CONTEXT_PATH}/static/assets/img/telu-building.png`;
    
    // Path Uploaded Image (Dynamic via Controller)
    const imgPath = room.imageUrl 
        ? `${window.CONTEXT_PATH}/images/${room.imageUrl}` 
        : defaultImg;
        
    const imgElement = document.getElementById('img-main');
    
    imgElement.src = imgPath;
    
    // Handler jika gambar upload tidak ditemukan (404), ganti ke default
    imgElement.onerror = function() {
        if (this.src !== defaultImg) {
            this.src = defaultImg;
        }
    };

    document.getElementById('btn-reservasi').href = `reservation.html?room_id=${room.id}`;
}

function initCalendarListeners(roomId) {
    document.querySelectorAll('input[name="view"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentViewMode = e.target.value;
            updateCalendarDisplay(roomId);
        });
    });

    document.getElementById('monthPicker').addEventListener('change', (e) => {
        if (e.target.value) {
            currentViewDate = new Date(e.target.value + "-01");
            updateCalendarDisplay(roomId);
        }
    });
}

function updateCalendarDisplay(roomId) {
    updateMonthYearHeader();
    renderCalendarBase();
    loadReservations(roomId);
}

function updateMonthYearHeader() {
    const options = { month: 'long', year: 'numeric' };
    const dateString = currentViewDate.toLocaleDateString('id-ID', options);
    document.getElementById('current-month-year').textContent = dateString;
}

function renderCalendarBase() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = ""; 
    
    const numDays = currentViewMode === 'day' ? 1 : 7;
    grid.style.gridTemplateColumns = `80px repeat(${numDays}, 1fr)`;

    const startDate = new Date(currentViewDate);
    if (currentViewMode === 'week') {
        // Set ke hari Senin (1) minggu ini (atau Minggu (0) sesuai preferensi)
        const day = currentViewDate.getDay();
        const diff = currentViewDate.getDate() - day + (day === 0 ? -6 : 1); 
        startDate.setDate(diff);
    }

    // 1. Render Header WIB +7
    const timeHeader = document.createElement('div');
    timeHeader.className = 'time-label border-end bg-light text-muted small py-2 text-center';
    timeHeader.textContent = "WIB +7";
    grid.appendChild(timeHeader);

    // 2. Render Header Hari
    for (let i = 0; i < numDays; i++) {
        const headerDate = new Date(startDate);
        headerDate.setDate(startDate.getDate() + i);

        const div = document.createElement('div');
        div.className = 'day-header border-end text-center p-2';
        
        const dayName = headerDate.toLocaleDateString('id-ID', { weekday: 'long' });
        const monthName = headerDate.toLocaleDateString('id-ID', { month: 'short' });
        
        div.innerHTML = `<strong>${headerDate.getDate().toString().padStart(2, '0')}</strong><br><small>${monthName}, ${dayName}</small>`;
        grid.appendChild(div);
    }

    // 3. Render Baris Waktu (07:00 - 21:00)
    for (let hour = 7; hour <= 21; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        
        const label = document.createElement('div');
        label.className = 'time-slot-label';
        label.textContent = `${hourStr}:00`;
        grid.appendChild(label);

        for (let i = 0; i < numDays; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            // Use fungsi formatDateLocal agar tanggal 1 Januari tidak bergeser ke 31 Desember
            const dateStr = formatDateLocal(cellDate);

            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.id = `cell-${dateStr}-${hourStr}`;
            grid.appendChild(cell);
        }
    }
}

async function loadReservations(roomId) {
    try {
        // Gunakan path relatif agar aman dari masalah folder konteks server
        const res = await fetch(`${window.CONTEXT_PATH}/api/reservations?room_id=${roomId}`);
        const reservations = await res.json();
        renderReservationsOnGrid(reservations);
    } catch (err) {
        console.error("Gagal memuat reservasi:", err);
    }
}

function renderReservationsOnGrid(reservations) {
    reservations.forEach(res => {
        // 1. Filter Status (approved & pending)
        const status = res.status ? res.status.toLowerCase() : '';
        if (status !== 'approved' && status !== 'pending') return;

        // 2. Pembersihan format tanggal agar ID sel cocok
        const cleanDate = res.date.split('T')[0].split(' ')[0];

        // 3. Mapping Role ke Bahasa Indonesia agar lebih rapih
        let displayedRole = "";
        if (res.userRole) {
            const roleLower = res.userRole.toLowerCase();
            if (roleLower === 'student') {
                displayedRole = "Mahasiswa";
            } else if (roleLower === 'lecturer') {
                displayedRole = "Dosen";
            } else {
                // Kapitalisasi huruf pertama jika role lain (admin, dsb)
                displayedRole = roleLower.charAt(0).toUpperCase() + roleLower.slice(1);
            }
        }

        // 4. Parsing Waktu & Durasi
        const [startH, startM] = res.startTime.split(':').map(Number);
        const [endH, endM] = res.endTime.split(':').map(Number);

        let startDecimal = startH + (startM / 60);
        let endDecimal = endH + (endM / 60);
        if (endDecimal < startDecimal) endDecimal += 12;

        const duration = endDecimal - startDecimal;
        
        // 5. Target ID sel
        const targetCellId = `cell-${cleanDate}-${startH.toString().padStart(2, '0')}`;
        const targetCell = document.getElementById(targetCellId);
        
        if (targetCell) {
            // Kalkulasi posisi top jika mulai di menit tertentu (misal 07:30)
            const topOffset = (startM / 60) * 100;

            targetCell.innerHTML = `
                <div class="event-card-green shadow-sm" 
                     style="height: calc(${duration * 100}% - 8px); 
                            top: calc(${topOffset}% + 4px);
                            z-index: 10; 
                            position: absolute; 
                            width: 95%; 
                            left: 2px;">
                    <strong class="d-block text-truncate">${res.userName || 'User'}</strong>
                    <small class="d-block opacity-75">${displayedRole}</small>
                    <hr class="my-1 opacity-25">
                    <p class="mb-0 small text-truncate" title="${res.reason}">${res.reason || 'Kegiatan'}</p>
                </div>
            `;
        }
    });
}