function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:8080/WebContent/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      fetchProfile();
    } else {
      document.getElementById("error").innerText = data.message;
    }
  })
  .catch(err => {
    document.getElementById("error").innerText = "Server error";
  });
}

function fetchProfile() {
  fetch("http://localhost:8080/WebContent/api/users/me", {
    method: "GET",
    credentials: "include"
  })
  .then(res => res.json())
  .then(user => {
    redirectByRole(user.role);
  });
}

function redirectByRole(role) {
  if (role === "admin") {
    window.location.href = "admin.html";
  } else if (role === "student") {
    window.location.href = "student.html";
  } else if (role === "lecturer") {
    window.location.href = "lecturer.html";
  }
}
