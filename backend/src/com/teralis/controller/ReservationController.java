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
    private static class UpdateStatusRequest {
        String status;
    }

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

            // SIMPAN HASIL KE DALAM VARIABEL BOOLEAN
            boolean isCreated = reservationDAO.create(data);

            if (isCreated) {
                JsonResponse.success(resp, "Reservation created");
            } else {
                // Jika gagal di DB, beritahu frontend agar tidak bingung
                JsonResponse.error(resp, 500, "Database error: Gagal menyimpan reservasi.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse.error(resp, 400, "Invalid data or file upload error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            int id = PathUtil.getIdFromUrl(req);
        
            // Baca body JSON
            UpdateStatusRequest data = JsonResponse.readBody(req, UpdateStatusRequest.class);

            // Cek apakah data atau status bernilai null
            if (data == null || data.status == null || data.status.trim().isEmpty()) {
                JsonResponse.error(resp, 400, "Invalid JSON data: Status is required");
                return;
            }

            // Eksekusi Update ke Database
            boolean isUpdated = reservationDAO.updateStatus(id, data.status);

            if (isUpdated) {
                JsonResponse.success(resp, "Status updated successfully to " + data.status);
            } else {
                JsonResponse.error(resp, 500, "Gagal memperbarui status di database (ID tidak ditemukan)");
            }
        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse.error(resp, 500, "Server Internal Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 1. Cek Sesi: Hanya mahasiswa yang bersangkutan yang boleh membatalkan
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            JsonResponse.error(resp, 401, "Unauthorized");
            return;
        }

        try {
            // Ambil ID dari URL (misal: /api/reservations/12)
            int reservationId = PathUtil.getIdFromUrl(req);
            int userId = (int) session.getAttribute("userId");

            
            boolean success = reservationDAO.deleteIfOwnedByUser(reservationId, userId);

            if (success) {
                JsonResponse.success(resp, "Reservation cancelled successfully");
            } else {
                JsonResponse.error(resp, 403, "Gagal membatalkan. Reservasi tidak ditemukan atau sudah diproses.");
            }
        } catch (Exception e) {
            JsonResponse.error(resp, 400, "Invalid ID");
        }
    }
}