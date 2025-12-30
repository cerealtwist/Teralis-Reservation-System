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