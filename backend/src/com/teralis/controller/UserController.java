package com.teralis.controller;

import com.teralis.dao.UserDAO;
import com.teralis.model.User;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.List;


@WebServlet("api/users/*")
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
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException{
        HttpSession session = req.getSession(false);
        String role = (String) session.getAttribute("role");

        if(!"admin".equals(role)) {
            JsonResponse.error(resp, 403, "Forbidden: Admin only");
            return;
        }

        User u = JsonResponse.readBody(req, User.class);

        if (userDAO.createUser(u)){

        }
    }

}
