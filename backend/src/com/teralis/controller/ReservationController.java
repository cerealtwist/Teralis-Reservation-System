package com.teralis.controller;

import com.teralis.dao.ReservationDAO;
import com.teralis.model.Reservation;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/reservations/*")
public class ReservationController extends HttpServlet {

    private final ReservationDAO reservationDAO = new ReservationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        HttpSession session = req.getSession(false);
        int userId = (int) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        List<Reservation> list;

        if (role.equals("admin")) {
            list = reservationDAO.getAll();
        } else {
            list = reservationDAO.getByUser(userId);
        }

        JsonResponse.send(resp, list);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        Reservation r = JsonResponse.readBody(req, Reservation.class);

        if (reservationDAO.create(r)) {
            JsonResponse.success(resp, "Reservation created");
        } else {
            JsonResponse.error(resp, 500, "Failed to create reservation");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        int id = PathUtil.getIdFromUrl(req);

        class UpdateStatus {
            String status;
        }

        UpdateStatus data = JsonResponse.readBody(req, UpdateStatus.class);

        if (reservationDAO.updateStatus(id, data.status)) {
            JsonResponse.success(resp, "Status updated");
        } else {
            JsonResponse.error(resp, 500, "Failed to update status");
        }
    }
}
