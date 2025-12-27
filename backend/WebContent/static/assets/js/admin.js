function loadRooms() {
  fetch("http://localhost:8080/WebContent/api/rooms", {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    let html = "<ul class='list-group'>";
    data.forEach(r => {
      html += `<li class="list-group-item">
        ${r.name} - ${r.status}
      </li>`;
    });
    html += "</ul>";
    document.getElementById("roomList").innerHTML = html;
  });
}

function logout() {
  fetch("http://localhost:8080/WebContent/api/auth/logout", {
    credentials: "include"
  }).then(() => window.location.href = "login.html");
}

loadRooms();
