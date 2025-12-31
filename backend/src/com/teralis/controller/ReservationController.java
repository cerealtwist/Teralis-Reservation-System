package com.teralis.controller;

import com.teralis.dao.ReservationDAO;
import com.teralis.model.Reservation;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.File;
import java.io.IOException;
import java.sql.Date;
import java.sql.Time;
import java.util.Collection;
import java.util.List;

@WebServlet("/api/reservations/*")
// TAMBAHKAN MULTIPART CONFIG UNTUK HANDLE UPLOAD FILE
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2, // 2MB
    maxFileSize = 1024 * 1024 * 10,      // 10MB
    maxRequestSize = 1024 * 1024 * 50    // 50MB
)
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
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null || !"student".equals(session.getAttribute("role"))) {
            JsonResponse.error(resp, 403, "Student only");
            return;
        }

        // KARENA MENGGUNAKAN MULTIPART (FormData) AMBIL PARAMETER SECARA MANUAL
        // DONT USE JsonResponse.readBody untuk request multipart!
        try {
            Reservation data = new Reservation();
            data.setRoomId(Integer.parseInt(req.getParameter("roomId")));
            data.setDate(Date.valueOf(req.getParameter("date")));
            data.setStartTime(Time.valueOf(req.getParameter("startTime")));
            data.setEndTime(Time.valueOf(req.getParameter("endTime")));
            data.setReason(req.getParameter("reason"));

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

            // --- LOGIKA UPLOAD FILE ---
            String uploadPath = getServletContext().getRealPath("") + File.separator + "uploads";
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) uploadDir.mkdir();

            Collection<Part> parts = req.getParts();
            for (Part part : parts) {
                // Pastikan mengambil part dari field "files"
                if (part.getName().equals("files") && part.getSize() > 0) {
                    String fileName = System.currentTimeMillis() + "_" + part.getSubmittedFileName();
                    part.write(uploadPath + File.separator + fileName);
                    
                    // SET DOCUMENT PATH KE OBJEK RESERVATION
                    // Jika user upload banyak file, gabungkan file (String joining)
                    data.setDocumentPath(fileName); 
                }
            }
            // --------------------------

            data.setUserId((int) session.getAttribute("userId"));
            data.setStatus("pending");

            // Gunakan metode create DAO
            reservationDAO.create(data);
            JsonResponse.success(resp, "Reservation created");

        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse.error(resp, 400, "Invalid data or file upload error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        int id = PathUtil.getIdFromUrl(req);

        class UpdateStatus {
            String status;
        }

        // Untuk doPut biasanya tetap menggunakan JSON (bukan FormData)
        UpdateStatus data = JsonResponse.readBody(req, UpdateStatus.class);

        if (reservationDAO.updateStatus(id, data.status)) {
            JsonResponse.success(resp, "Status updated");
        } else {
            JsonResponse.error(resp, 500, "Failed to update status");
        }
    }
}