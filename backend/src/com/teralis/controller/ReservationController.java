package com.teralis.controller;

import com.teralis.dao.ReservationDAO;
import com.teralis.model.Reservation;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.sql.Date;
import java.util.List;

@WebServlet("/api/reservations/*")
public class ReservationController extends HttpServlet {

    private final ReservationDAO reservationDAO = new ReservationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String roomIdParam = req.getParameter("room_id");
        List<Reservation> list;

        // 1. if exist parameter room_id: Ambil jadwal untuk kalender
        if (roomIdParam != null && !roomIdParam.isEmpty()) {
            int roomId = Integer.parseInt(roomIdParam);
            list = reservationDAO.getByRoom(roomId);
        } else {
            // 2. else: Ambil berdasarkan session (untuk halaman profil/admin)
            HttpSession session = req.getSession(false);
            if (session == null) {
                JsonResponse.error(resp, 401, "Unauthorized");
                return;
            }
            int userId = (int) session.getAttribute("userId");
            String role = (String) session.getAttribute("role");

            if (role.equals("admin")) {
                list = reservationDAO.getAll();
            } else {
                list = reservationDAO.getByUser(userId);
            }
        }

        JsonResponse.send(resp, list);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session == null || !"student".equals(session.getAttribute("role"))) {
            JsonResponse.error(resp, 403, "Student only");
            return;
        }

        Reservation data = JsonResponse.readBody(req, Reservation.class);

        if (data == null) {
            JsonResponse.error(resp, 400, "Invalid request body");
            return;
        }

        // Tanggal tidak boleh lewat
        if (data.getDate().before(new Date(System.currentTimeMillis()))) {
            JsonResponse.error(resp, 400, "Date must be today or later");
            return;
        }

        // Cek reservasi bentrok
        boolean available = reservationDAO.isTimeSlotAvailable(
            data.getRoomId(),
            data.getDate(),
            data.getStartTime(),
            data.getEndTime()
        );

        if (!available) {
            JsonResponse.error(resp, 409, "Time slot already booked");
            return;
        }

        data.setUserId((int) session.getAttribute("userId"));
        data.setStatus("pending");

        reservationDAO.create(data);
        JsonResponse.success(resp, "Reservation created");
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

