const API_BASE_URL = "/WebContent/api"; // Sesuaikan jika nama project di URL browser berbeda

// Variabel global untuk filter
let allRoomsInBuilding = []; 

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

async function loadRoomTypes() {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/types`);
    if (!res.ok) throw new Error("Gagal mengambil tipe ruangan");
    
    const types = await res.json();
    const typeSelect = document.getElementById("typeSelect");
    
    typeSelect.innerHTML = '<option value="">Semua Tipe</option>';
    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      typeSelect.appendChild(opt);
    });
  } catch (error) {
    console.error("Gagal memuat tipe ruangan:", error);
  }
}

function applyFilters() {
  const selectedType = document.getElementById("typeSelect").value;
  const minCapacity = parseInt(document.getElementById("capacitySlider").value);
  const buildingSelect = document.getElementById("buildingSelect");
  
  if (buildingSelect.selectedIndex <= 0) return;
  
  const buildingName = buildingSelect.options[buildingSelect.selectedIndex].text;
  const container = document.getElementById("room-list");

  container.innerHTML = "";

  const filteredRooms = allRoomsInBuilding.filter(r => {
    const matchType = selectedType === "" || r.type === selectedType;
    const matchCapacity = r.capacity >= minCapacity;
    return matchType && matchCapacity;
  });

  if (filteredRooms.length === 0) {
    container.innerHTML = `<div class="text-center w-100 py-5"><p class="text-muted">Tidak ada ruangan yang cocok.</p></div>`;
    return;
  }

  filteredRooms.forEach(r => {
    container.innerHTML += roomCardTemplate(r, buildingName);
  });
}

document.getElementById("capacitySlider").addEventListener("input", e => {
  document.getElementById("capacityValue").textContent = e.target.value;
  applyFilters(); 
});

function roomCardTemplate(room, buildingName) {
  const statusClass = room.status === 'available' ? 'status-available' : 'status-maintenance';
  const statusText = room.status === 'available' ? 'Tersedia' : 'Perbaikan';
  
  // === PERBAIKAN PATH ===
  const contextPath = "/WebContent"; 
  
  // 1. Gambar Default (Static Asset) -> Pakai /static/assets/img
  const defaultImage = `${contextPath}/static/assets/img/telu-building.png`; 
  
  // 2. Gambar Upload (Dynamic) -> Pakai /images/ (via ImageController)
  // ImageController akan membaca dari C:/teralis_storage
  const imageSource = room.imageUrl 
        ? `${contextPath}/images/${room.imageUrl}` 
        : defaultImage;
  
  const detailUrl = `room-detail.html?id=${room.id}`;

  return `
    <div class="room-card" onclick="window.location.href='${detailUrl}'" style="cursor: pointer;">
      <div class="room-img-container">
        <img src="${imageSource}" alt="${room.name}" onerror="this.onerror=null;this.src='${defaultImage}';">
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
        <p class="room-facilities">${room.facilities || "Fasilitas standar tersedia."}</p>
        <a href="${detailUrl}" class="btn-book">Lihat Detail</a>
      </div>
    </div>`;
}

async function loadRooms(buildingId, buildingName) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms?building_id=${buildingId}`);
    const rooms = await res.json();
    
    allRoomsInBuilding = rooms;
    document.getElementById("result-title").textContent = `Daftar Ruangan: ${buildingName}`;
    applyFilters(); 
  } catch (err) {
    console.error("Gagal memuat ruangan:", err);
  }
}

document.getElementById("buildingSelect").addEventListener("change", e => {
  const selected = e.target.options[e.target.selectedIndex];
  if (!selected.value) return;
  document.getElementById("typeSelect").value = "";
  document.getElementById("capacitySlider").value = 0;
  document.getElementById("capacityValue").textContent = 0;
  loadRooms(selected.value, selected.text);
});

document.getElementById("typeSelect").addEventListener("change", applyFilters);

loadBuildings();
loadRoomTypes();