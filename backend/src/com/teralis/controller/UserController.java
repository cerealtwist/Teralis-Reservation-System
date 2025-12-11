package com.teralis.controller;

import com.teralis.dao.UserDAO;
import com.teralis.model.User;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.List;


@WebServlet("/api/users/*")
public class UserController extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    // -- GET (Fetch User Data) --
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException{
        HttpSession session = req.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            JsonResponse.error(resp, 401, "Authentication required");
            return;
        }

        String role = (String) session.getAttribute("role");
        String path = req.getPathInfo();

        // GET /api/users/me
                if ("/me".equals(path)) {
            int id = (int) session.getAttribute("userId");
            User u = userDAO.getById(id);
            JsonResponse.send(resp, u);
            return;
        }

        // GET ALL (admin only)
        if (path == null || "/".equals(path)) {
            if (!"admin".equals(role)) {
                JsonResponse.error(resp, 403, "Forbidden: admin only");
                return;
            }

            List<User> list = userDAO.getAll();
            JsonResponse.send(resp, list);
            return;
        }

        // GET BY ID /api/users/:id
        Integer id = PathUtil.getIdFromUrl(req);
        {
            User u = userDAO.getById(id);
            if (u == null) {
                JsonResponse.error(resp, 404, "User not found");
                return;
            }
            JsonResponse.send(resp, u);
            return;
        }
    }

    // -- POST (Create User) --
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        HttpSession session = req.getSession(false);

        if (session == null || !"admin".equals(session.getAttribute("role"))) {
            JsonResponse.error(resp, 403, "Forbidden: admin only");
            return;
        }

        User newUser = JsonResponse.readBody(req, User.class);

        if (newUser == null) {
            JsonResponse.error(resp, 400, "Invalid JSON body");
            return;
        }

        boolean ok = userDAO.createUser(newUser);

        if (ok) JsonResponse.success(resp, "User created");
        else JsonResponse.error(resp, 500, "Failed to create user");
    }

    // -- PUT (Update User) --
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        HttpSession session = req.getSession(false);

        if (session == null) {
            JsonResponse.error(resp, 401, "Not authenticated");
            return;
        }

        int requesterId = (int) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");
        String path = req.getPathInfo();

        User data = JsonResponse.readBody(req, User.class);

        if (data == null) {
            JsonResponse.error(resp, 400, "Invalid body");
            return;
        }

        // /api/users/me
        if ("/me".equals(path)) {
            boolean ok = userDAO.updateUser(requesterId, data);
            if (ok) JsonResponse.success(resp, "Profile updated");
            else JsonResponse.error(resp, 500, "Failed to update profile");
            return;
        }

        // Admin update /api/users/:id
        if (!"admin".equals(role)) {
            JsonResponse.error(resp, 403, "Forbidden: admin only");
            return;
        }

        Integer targetId = PathUtil.getIdFromUrl(req);
        boolean ok = userDAO.updateUser(targetId, data);

        if (ok) JsonResponse.success(resp, "User updated");
        else JsonResponse.error(resp, 500, "Failed to update user");
    }

    // -- DELETE (Remove User) --
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        HttpSession session = req.getSession(false);

        if (session == null || !"admin".equals(session.getAttribute("role"))) {
            JsonResponse.error(resp, 403, "Admin only");
            return;
        }

        Integer id = PathUtil.getIdFromUrl(req);
        boolean ok = userDAO.delete(id);

        if (ok) JsonResponse.success(resp, "User deleted");
        else JsonResponse.error(resp, 500, "Failed to delete user");
    }
}
