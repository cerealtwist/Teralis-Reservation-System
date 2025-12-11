package com.teralis.controller;

import com.teralis.dao.UserDAO;
import com.teralis.model.User;
import com.teralis.utils.JsonResponse;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.List;


@WebServlet("api/users/*")
public class UserController extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException{
        HttpSession session = req.getSession(false);
        String role = (String) session.getAttribute("role");

        String path = req.getPathInfo();

        // GET /api/users/me
        if ("/me".equals(path)){
            int userId = (int) session.getAttribute("userId");

            User u = userDAO.getById(userId);
            if (u == null){
                JsonResponse.error(resp, 404, "User not found");
                return;
            }
            JsonResponse.send(resp, u);
            return;
        }

        if(!"admin".equals(role)){
            JsonResponse.error(resp, 403, "Forbidden: Admin only");
            return;
        }

        List<User> list = userDAO.getAll();
        JsonResponse.send(resp, list);
    }

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
