function checkSession(allowedRoles) {
  fetch("http://localhost:8080/WebContent/api/users/me", {
    credentials: "include"
  })
  .then(res => {
    if (res.status === 401) {
      window.location.href = "login.html";
      return;
    }
    return res.json();
  })
  .then(user => {
    if (!allowedRoles.includes(user.role)) {
      alert("Access denied");
      window.location.href = "login.html";
    }
  });
}
