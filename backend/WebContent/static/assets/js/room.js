const API_BASE_URL = "/WebContent/api";

async function loadBuildings() {
  try {
    const res = await fetch(`${API_BASE_URL}/buildings`);
    if (!res.ok) throw new Error("Gagal mengambil data gedung");
    
    const buildings = await res.json();
    const select = document.getElementById("buildingSelect");
    
    // Reset dan tambah placeholder
    select.innerHTML = '<option value="">-- Pilih Gedung --</option>';

    buildings.forEach(b => {
      // HAPUS filter 'if (b.active === false...)' di sini
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
  return `
    <div class="room-card">
      <img src="assets/img/placeholder.jpg" alt="${room.name}">

      <div class="room-content">
        <h3>${buildingName} – ${room.name}</h3>
        <p class="room-desc">
          Ruangan tersedia untuk kegiatan akademik maupun non-akademik.
        </p>
        <span class="capacity">
          Kapasitas: ${room.capacity} orang
        </span>
      </div>

      <a href="reservation.html?room_id=${room.id}" class="arrow-btn">→</a>
    </div>
  `;
}

async function loadRooms(buildingId, buildingName) {
  // Panggil endpoint yang sudah mendukung filter building_id
  const res = await fetch(`${API_BASE_URL}/rooms?building_id=${buildingId}`);
  const rooms = await res.json();

  document.getElementById("result-title").textContent = `Daftar Ruangan: ${buildingName}`;
  const container = document.getElementById("room-list");
  container.innerHTML = "";

  if (rooms.length === 0) {
    container.innerHTML = "<p class='text-center w-full py-10'>Tidak ada ruangan tersedia di gedung ini.</p>";
    return;
  }

  rooms.forEach(r => {
    container.innerHTML += roomCardTemplate(r, buildingName);
  });
}

document.getElementById("buildingSelect")
  .addEventListener("change", e => {
    const selected = e.target.options[e.target.selectedIndex];
    if (!selected.value) return;

    loadRooms(selected.value, selected.text);
  });

loadBuildings();


