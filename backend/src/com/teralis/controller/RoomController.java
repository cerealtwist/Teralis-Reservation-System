package com.teralis.controller;

import com.teralis.dao.RoomDAO;
import com.teralis.model.Room;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.http.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.*;
import java.io.File;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/rooms/*")
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 1, // 1MB
    maxFileSize = 1024 * 1024 * 5,      // 5MB
    maxRequestSize = 1024 * 1024 * 10   // 10MB
)
public class RoomController extends HttpServlet {

    private final RoomDAO roomDAO = new RoomDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Cek apakah ada ID di URL (with PathUtil)
        int id = PathUtil.getIdFromUrl(req);

        if (id != -1) {
            // Jika ada ID, ambil detail satu ruangan
            Room room = roomDAO.getRoomById(id);
            if (room != null) {
                JsonResponse.send(resp, room);
            } else {
                JsonResponse.error(resp, 404, "Ruangan tidak ditemukan");
            }
        } else {
            // Jika !ID, ambil daftar ruangan (berdasarkan gedung atau semua)
            String buildingIdParam = req.getParameter("building_id");
            List<Room> rooms;

            if (buildingIdParam != null && !buildingIdParam.isEmpty()) {
                int buildingId = Integer.parseInt(buildingIdParam);
                rooms = roomDAO.getRoomsByBuilding(buildingId); 
            } else {
                rooms = roomDAO.getAllRooms();
            }
            JsonResponse.send(resp, rooms);
        }
    }

    /**
     *  POST UNTUK CREATE & UPDATE 
     * (Untuk menangani stabilitas Multipart/Form-Data)
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        try {
            // 1. Ambil semua parameter dari FormData
            String name = req.getParameter("name");
            String buildingIdStr = req.getParameter("buildingId");
            String capacityStr = req.getParameter("capacity");
            String idStr = req.getParameter("id");
            
            // Parameter baru yang ditambahkan:
            String type = req.getParameter("type");
            String facilities = req.getParameter("facilities");
            String status = req.getParameter("status");

            Room room;
            int id = -1;

            // 2. Tentukan apakah aksi ini UPDATE atau CREATE
            if (pathInfo != null && pathInfo.contains("/update") && idStr != null) {
                id = Integer.parseInt(idStr);
                // AMBIL DATA LAMA: Agar field yang tidak diedit tidak hilang (Partial Update)
                room = roomDAO.getRoomById(id);
                if (room == null) {
                    JsonResponse.error(resp, 404, "Ruangan tidak ditemukan");
                    return;
                }
            } else {
                // Jika Create, buat objek baru
                room = new Room();
            }

            // 3. Update field objek room dengan data terbaru dari form
            if (name != null) room.setName(name);
            if (buildingIdStr != null) room.setBuildingId(Integer.parseInt(buildingIdStr));
            if (capacityStr != null) room.setCapacity(Integer.parseInt(capacityStr));
            
            // Set field tambahan:
            if (type != null) room.setType(type);
            if (facilities != null) room.setFacilities(facilities);
            if (status != null) room.setStatus(status);

            // 4. LOGIKA UPLOAD GAMBAR
            Part filePart = req.getPart("image");
            if (filePart != null && filePart.getSize() > 0) {
                String originalName = filePart.getSubmittedFileName();
                // Generate nama file unik dengan timestamp
                String fileName = "room_" + System.currentTimeMillis() + "_" + originalName.replaceAll("\\s+", "_");
                String uploadPath = getServletContext().getRealPath("/") + "assets" + File.separator + "img";
                
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) uploadDir.mkdirs();

                filePart.write(uploadPath + File.separator + fileName);
                room.setImageUrl(fileName); // Simpan nama file foto baru
            }

            // 5. EKSEKUSI KE DATABASE LEWAT DAO
            boolean success = (id != -1) ? roomDAO.updateRoom(id, room) : roomDAO.createRoom(room);
            
            if (success) {
                JsonResponse.success(resp, "Data ruangan berhasil disimpan");
            } else {
                JsonResponse.error(resp, 500, "Gagal menyimpan data ke database");
            }
        } catch (Exception e) {
            e.printStackTrace();
            JsonResponse.error(resp, 500, "Terjadi kesalahan server: " + e.getMessage());
        }
    }

    // doPut dihapus/dikosongkan karena logikanya sudah dipindah ke doPost (/update)
    // agar kompatibel dengan multipart upload

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int id = PathUtil.getIdFromUrl(req);
        if (id != -1 && roomDAO.deleteRoom(id)) {
            JsonResponse.success(resp, "Ruangan dihapus");
        } else {
            JsonResponse.error(resp, 500, "Gagal menghapus");
        }
    }
}