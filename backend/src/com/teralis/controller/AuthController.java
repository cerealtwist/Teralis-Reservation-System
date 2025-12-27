package com.teralis.controller;

import com.teralis.dao.UserDAO;
import com.teralis.model.User;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PasswordHash;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;

@WebServlet("/api/auth/*")
public class AuthController extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    // FIX: make LoginRequest static to fix JSON parsing
    private static class LoginRequest{
        public String email;
        public String password;
    }

    private static class LoginResponse {
        public String status;
        public String message;
        public String role;

        public LoginResponse(String status, String message, String role) {
            this.status = status;
            this.message = message;
            this.role = role;
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException{
        String path = req.getPathInfo();

        if ("/login".equals(path)){
            handleLogin(req, resp);
        } else {
            JsonResponse.error(resp, 404, "Unknown POST endpoint.");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException{

        LoginRequest data = JsonResponse.readBody(req, LoginRequest.class);

        if (data == null || data.email == null || data.password == null) {
            JsonResponse.error(resp, 400, "Email and password required");
            return;
        }

        User user = userDAO.findByEmail(data.email);

        if (user == null) {
            JsonResponse.error(resp, 401, "Invalid Credentials");
            return;
        }

        String hashed = PasswordHash.hash(data.password);

        if (!hashed.equals(user.getPasswordHash())) {
            JsonResponse.error(resp, 401, "Invalid Credentials");
            return;
        }

        // create session
        HttpSession session = req.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("role", user.getRole());
        session.setAttribute("email", user.getEmail());

        JsonResponse.send(resp, new LoginResponse("success", "Login success.", user.getRole()));

    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        String path = req.getPathInfo();

        if ("/logout".equals(path)) {
            HttpSession session = req.getSession(false);
            if (session != null) session.invalidate();

            JsonResponse.success(resp, "Logged out");
        } else {
            JsonResponse.error(resp, 404, " Unknown GET endpoint");
        }
    }


    
}