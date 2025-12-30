package com.teralis.dao;

import com.teralis.model.User;
import java.util.List;

public class DebugDatabase {
    public static void main(String[] args) {
        UserDAO dao = new UserDAO();
        System.out.println(">>> DEBUG: Memulai pengetesan pengambilan data...");

        // Memanggil method getAll() yang berisi "SELECT * FROM users"
        List<User> listUser = dao.getAll();

        if (listUser.isEmpty()) {
            System.out.println(">>> DEBUG: Koneksi ke 'teralis' BERHASIL, tetapi tabel 'users' KOSONG.");
        } else {
            System.out.println(">>> DEBUG: Berhasil menemukan " + listUser.size() + " user di database:");
            System.out.println("==================================================");
            
            for (User u : listUser) {
                System.out.println("ID        : " + u.getId());
                System.out.println("Nama      : " + u.getName());
                System.out.println("Email     : " + u.getEmail());
                System.out.println("Role      : " + u.getRole());
                System.out.println("Pass Hash : " + u.getPasswordHash());
                
                // Cek panjang hash (Harus 64 untuk SHA-256)
                int length = (u.getPasswordHash() != null) ? u.getPasswordHash().length() : 0;
                System.out.println("Panjang   : " + length + " karakter");
                System.out.println("--------------------------------------------------");
            }
        }
    }
}