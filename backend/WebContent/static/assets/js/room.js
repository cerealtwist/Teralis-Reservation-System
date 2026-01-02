const API_BASE_URL = "/WebContent/api";

async function loadBuildings() {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings`);
    if (!res.ok) throw new Error("Gagal mengambil data gedung");
    
    const buildings = await res.json();
    const select = document.getElementById("buildingSelect");
    
    select.innerHTML = '<option value="">-- Pilih Gedung --</option>';

    buildings.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.name;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Gagal memuat gedung:", error);
  }
}

function roomCardTemplate(room, buildingName) {
  // Logika Status Badge
  const statusClass = room.status === 'available' ? 'status-available' : 'status-maintenance';
  const statusText = room.status === 'available' ? 'Tersedia' : 'Perbaikan';
  const isMaintenance = room.status === 'maintenance';

  // Jika room.imageUrl ada di database, gunakan itu. 
  // Jika kosong, gunakan gambar default 'telu-building.png'
  const contextPath = "/WebContent"; 
  const defaultImage = `${contextPath}/assets/img/telu-building.png`;
    
    // Pastikan path gambar menggunakan contextPath
  const imageSource = room.imageUrl 
        ? `${contextPath}/assets/img/${room.imageUrl}` 
        : defaultImage;

  // URL halaman detail dengan parameter ID
  const detailUrl = `room-detail.html?id=${room.id}`;

  return `
    <div class="room-card" onclick="window.location.href='${detailUrl}'" style="cursor: pointer;">
      <div class="room-img-container">
        <img src="${imageSource}" alt="${room.name}">
        <span class="room-badge ${statusClass}">${statusText}</span>
      </div>
      
      <div class="room-card-body">
        <div class="room-card-header">
            <span class="room-type">${room.type || 'General'}</span>
            <h3 class="room-title">${buildingName} – ${room.name}</h3>
        </div>
        
        <div class="room-meta">
          <div class="meta-item">
            <img src="assets/icons/ruangan.svg" alt="Capacity">
            <span>${room.capacity} Orang</span>
          </div>
        </div>

        <p class="room-facilities">
          ${room.facilities || "Fasilitas standar tersedia untuk kegiatan akademik."}
        </p>

        <a href="${detailUrl}" class="btn-book">Lihat Detail</a>
      </div>
    </div>
  `;
}

async function loadRooms(buildingId, buildingName) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms?building_id=${buildingId}`);
    const rooms = await res.json();

    document.getElementById("result-title").textContent = `Daftar Ruangan: ${buildingName}`;
    const container = document.getElementById("room-list");
    container.innerHTML = "";

    if (rooms.length === 0) {
      container.innerHTML = `
        <div class="text-center w-100 py-5">
            <p class="text-muted">Tidak ada ruangan tersedia di gedung ini.</p>
        </div>`;
      return;
    }

    rooms.forEach(r => {
      container.innerHTML += roomCardTemplate(r, buildingName);
    });
  } catch (err) {
    console.error("Gagal memuat ruangan:", err);
  }
}

document.getElementById("buildingSelect").addEventListener("change", e => {
  const selected = e.target.options[e.target.selectedIndex];
  if (!selected.value) return;
  loadRooms(selected.value, selected.text);
});

loadBuildings();