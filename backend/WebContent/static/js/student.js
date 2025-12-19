function loadRooms() {
  fetch("http://localhost:8080/WebContent/api/rooms", {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    let html = "<table class='table'>";
    html += "<tr><th>Room</th><th>Capacity</th><th>Action</th></tr>";
    data.forEach(r => {
      html += `<tr>
        <td>${r.name}</td>
        <td>${r.capacity}</td>
        <td><button class="btn btn-primary btn-sm">Reserve</button></td>
      </tr>`;
    });
    html += "</table>";
    document.getElementById("rooms").innerHTML = html;
  });
}

function logout() {
  fetch("http://localhost:8080/WebContent/api/auth/logout", {
    credentials: "include"
  }).then(() => window.location.href = "login.html");
}

function rooms(){
  const payload = {
    roomId: roomId,
    date: document.getElementById("date").value,
    startTime: "09.00",
    endTime: "11.00"
  };

  fetch("http://localhost:8080/WebContent/api/reservations", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

loadRooms();
