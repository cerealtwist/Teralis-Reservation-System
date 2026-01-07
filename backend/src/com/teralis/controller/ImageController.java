package com.teralis.controller;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

// Endpoint ini akan dipanggil lewat URL: /images/namafile.jpg
@WebServlet("/images/*")
public class ImageController extends HttpServlet {

    private static final String UPLOAD_DIR = "C:" + File.separator + "teralis_storage";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String filename = req.getPathInfo(); // Mengambil /namafile.jpg

        if (filename == null || filename.equals("/")) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // Hapus tanda "/" di depan
        File file = new File(UPLOAD_DIR, filename.substring(1));

        if (!file.exists()) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND); // 404 jika file tidak ada
            return;
        }

        // Deteksi tipe file (jpg/png)
        String contentType = getServletContext().getMimeType(file.getName());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        resp.setContentType(contentType);

        // Kirim file ke browser
        try (FileInputStream in = new FileInputStream(file);
             OutputStream out = resp.getOutputStream()) {
            
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }
}