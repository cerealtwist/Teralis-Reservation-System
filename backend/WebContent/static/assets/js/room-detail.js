// STATE KALENDER
let currentViewDate = new Date(); 
let currentViewMode = 'week';

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('id');

    if (!roomId) return window.location.href = "room.html";

    initCalendarListeners(roomId);

    fetch(`/WebContent/api/rooms/${roomId}`)
        .then(res => res.json())
        .then(room => {
            renderRoomInfo(room);
            updateCalendarDisplay(roomId);
        })
        .catch(err => console.error("Error Detail:", err));
});

function renderRoomInfo(room) {
    document.getElementById('room-name').textContent = room.name;
    document.getElementById('room-building').textContent = room.buildingName;
    document.getElementById('room-capacity').textContent = `${room.capacity} Orang`;
    document.getElementById('breadcrumb-building-link').textContent = room.buildingName;
    document.getElementById('breadcrumb-room-active').textContent = room.name;
    
    const imgPath = room.imageUrl ? `assets/img/${room.imageUrl}` : 'assets/img/telu-building.png';
    document.getElementById('img-main').src = imgPath;
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
    
    // Konfigurasi Grid berdasarkan Mode
    const numDays = currentViewMode === 'day' ? 1 : 7;
    grid.style.gridTemplateColumns = `80px repeat(${numDays}, 1fr)`;

    // Tentukan Tanggal Mulai Tampilan
    const startDate = new Date(currentViewDate);
    if (currentViewMode === 'week') {
        // Set ke hari Minggu (0) minggu ini
        startDate.setDate(currentViewDate.getDate() - currentViewDate.getDay());
    }

    // 1. Render Header WIB +7
    const timeHeader = document.createElement('div');
    timeHeader.className = 'time-label border-end bg-light text-muted small py-2 text-center';
    timeHeader.textContent = "WIB +7";
    grid.appendChild(timeHeader);

    // 2. Render Header Hari (Dinamis)
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
            const dateStr = cellDate.toISOString().split('T')[0]; // Hasil: YYYY-MM-DD

            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            // ID Unik menggunakan Tanggal agar event tidak tertukar antar minggu
            cell.id = `cell-${dateStr}-${hourStr}`;
            grid.appendChild(cell);
        }
    }
}

async function loadReservations(roomId) {
    try {
        const res = await fetch(`/WebContent/api/reservations?room_id=${roomId}`);
        const reservations = await res.json();
        renderReservationsOnGrid(reservations);
    } catch (err) {
        console.error("Gagal memuat reservasi:", err);
    }
}

function renderReservationsOnGrid(reservations) {
    reservations.forEach(res => {
        // res.startTime (SQL format: "09:00:00") -> ambil "09"
        const startHour = res.startTime.split(':')[0];
        const endHour = res.endTime.split(':')[0];
        const duration = parseInt(endHour) - parseInt(startHour);

        // res.date (SQL format: "2025-12-31")
        const targetCellId = `cell-${res.date}-${startHour}`;
        const targetCell = document.getElementById(targetCellId);
        
        if (targetCell) {
            targetCell.innerHTML = `
                <div class="event-card-green shadow-sm" style="height: calc(${duration * 100}% - 8px); z-index: 10;">
                    <strong>${res.userName} (${duration} jam)</strong>
                    <small class="d-block opacity-75">${res.userRole}</small>
                    <hr class="my-1 opacity-25">
                    <p class="mb-0 small">${res.reason || 'Acara Ruangan'}</p>
                </div>
            `;
        }
    });
}