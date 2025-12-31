// STATE GLOBAL
let currentStep = 1;
let uploadedFiles = [];

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room_id');

    // 1. Auto-select room jika ada di URL
    if (roomId) {
        fetchRooms(roomId);
    }

    // 2. Auto-fill Data Peminjam dari Session/LocalStorage
    // Analogi: Seperti fitur 'Auto-complete' agar user tidak mengetik NIM yang sama berulang kali.
    document.getElementById('user_name').value = localStorage.getItem('userName') || 'Mahasiswa 1';
    document.getElementById('user_id_display').value = localStorage.getItem('userId') || 'NIM';

    // 3. Inisialisasi Logika Dropzone
    initUploadLogic();

    // 4. Listener Navigasi
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');

    btnNext.addEventListener('click', () => {
        if (currentStep < 4) {
            goToStep(currentStep + 1);
        } else {
            submitReservation();
        }
    });

    btnPrev.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });
});

function goToStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    
    document.querySelectorAll('.stepper-item').forEach((el, idx) => {
        const stepIdx = idx + 1;
        if (stepIdx < step) {
            el.classList.add('completed');
            el.classList.remove('active');
        } else if (stepIdx === step) {
            el.classList.add('active');
            el.classList.remove('completed');
        } else {
            el.classList.remove('active', 'completed');
        }
    });

    // Update Garis Progres Merah
    const totalSteps = 4;
    const progressWidth = ((step - 1) / (totalSteps - 1)) * 100;
    const lineProgress = document.getElementById('line-progress');
    if (lineProgress) lineProgress.style.width = `${progressWidth}%`;

    currentStep = step;
    
    // Update Teks Tombol
    document.getElementById('btnPrev').classList.toggle('d-none', step === 1);
    document.getElementById('btnNext').textContent = step === 4 ? 'Kirim Reservasi' : 'Lanjut';
}

function initUploadLogic() {
    const fileInput = document.getElementById('fileInput');
    const dropzone = document.getElementById('dropzone');
    const fileList = document.getElementById('fileList');
    const counter = document.getElementById('uploadCounter');

    if(!dropzone) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = "#E1251B";
        dropzone.style.background = "#fff5f5";
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = "#cbd5e1";
        dropzone.style.background = "#fafbff";
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleFiles(files) {
        for (let file of files) {
            if (uploadedFiles.length < 3) { 
                uploadedFiles.push(file);
                renderFileList();
            } else {
                alert("Maksimal 3 file.");
            }
        }
    }

    function renderFileList() {
        fileList.innerHTML = "";
        uploadedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'upload-file-item success shadow-sm';
            item.innerHTML = `
                <span class="upload-file-name">${file.name}</span>
                <span class="upload-file-remove" onclick="removeFile(${index})">Delete</span>
            `;
            fileList.appendChild(item);
        });
        counter.textContent = `Uploaded - ${uploadedFiles.length}/3 files`;
    }

    window.removeFile = (index) => {
        uploadedFiles.splice(index, 1);
        renderFileList();
    };
}

function submitReservation() {
    // Validasi Sederhana: Harus ada file yang diunggah
    if (uploadedFiles.length === 0) {
        alert("Mohon unggah surat permohonan terlebih dahulu.");
        return;
    }

    const btn = document.getElementById('btnNext');
    btn.disabled = true;
    btn.textContent = "Mengirim...";

    // Gunakan FormData  (mengirim FILE)
    const formData = new FormData();
    formData.append("roomId", document.getElementById('room_id').value);
    formData.append("date", document.getElementById('res_date').value);
    formData.append("startTime", document.getElementById('start_time').value + ":00");
    formData.append("endTime", document.getElementById('end_time').value + ":00");
    formData.append("reason", document.getElementById('purpose').value);
    
    uploadedFiles.forEach((file) => {
        formData.append("files", file);
    });

    fetch('/WebContent/api/reservations', {
        method: 'POST',
        body: formData 
    })
    .then(res => res.json())
    .then(result => {
        alert("Reservasi Berhasil Diajukan!");
        window.location.href = "status.html";
    })
    .catch(err => {
        console.error(err);
        alert("Gagal mengirim reservasi.");
        btn.disabled = false;
        btn.textContent = "Kirim Reservasi";
    });
}

function fetchRooms(selectedId) {
    fetch('/WebContent/api/rooms')
        .then(res => res.json())
        .then(rooms => {
            const select = document.getElementById('room_id');
            rooms.forEach(r => {
                const opt = new Option(r.name, r.id);
                if (r.id == selectedId) opt.selected = true;
                select.add(opt);
            });
        });
}