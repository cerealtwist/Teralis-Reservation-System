package com.teralis.dao;

import com.teralis.model.Admin;
import com.teralis.model.Lecturer;
import com.teralis.model.Student;
import com.teralis.model.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    // --GET All User (For Admin)--
    public List<User> getAll() {
        String sql = "SELECT * FROM users";
        List<User> list = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement st = conn.prepareStatement(sql);
             ResultSet rs = st.executeQuery()) {

            while (rs.next()) {
                list.add(mapToUser(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // --Find By Email--
    public User findByEmail(String email){
        String sql = "SELECT * FROM users WHERE email = ?";

        try(Connection conn = DBConnection.getConnection();
            PreparedStatement statement = conn.prepareStatement(sql)) {
                statement.setString(1, email);
                ResultSet rs = statement.executeQuery();

                if(rs.next()){
                    return mapToUser(rs);
                }
            
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public User getById(int id){
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
            PreparedStatement statement = conn.prepareStatement(sql)){
                statement.setInt(1, id);
                ResultSet rs = statement.executeQuery();

                if(rs.next()){
                    return mapToUser(rs);
                }
        } catch(Exception e){
            e.printStackTrace();
        }

        return null;
    }

    // PERBAIKAN 1: Tambahkan nim_nip ke INSERT
    public boolean createUser(User u){
        String sql = "INSERT INTO users(name, nim_nip, email, password, role) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
            PreparedStatement statement = conn.prepareStatement(sql)){
                statement.setString(1, u.getName());
                statement.setString(2, u.getNimNip()); // Tambahkan ini
                statement.setString(3, u.getEmail());
                statement.setString(4, u.getPasswordHash());
                statement.setString(5, u.getRole());
                
                return statement.executeUpdate() > 0;

        } catch(Exception e){
            e.printStackTrace();
        }

        return false;
    }

     // PERBAIKAN 2: Tambahkan nim_nip ke UPDATE
    public boolean updateUser(int id, User u) {
        String sql = "UPDATE users SET name = ?, nim_nip = ?, email = ?, role = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement st = conn.prepareStatement(sql)) {

            st.setString(1, u.getName());
            st.setString(2, u.getNimNip()); // Tambahkan ini
            st.setString(3, u.getEmail());
            st.setString(4, u.getRole());
            st.setInt(5, id);

            return st.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    // -- DELETE USER --
    public boolean delete(int id) {
        String sql = "DELETE FROM users WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement st = conn.prepareStatement(sql)) {

            st.setInt(1, id);
            return st.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    // PERBAIKAN 3: Ambil nim_nip dari ResultSet
    private User mapToUser(ResultSet rs) throws SQLException{
        String role = rs.getString("role");
        User u = null;

        switch (role) {
            case "student":
                u = new Student();
                break;
            case "lecturer":
                u = new Lecturer();
                break;
            case "admin":
                u = new Admin();
                break;
            default:
                throw new IllegalStateException("Unknown user role: " + role);
        }

        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setNimNip(rs.getString("nim_nip")); // Ambil nilai nim_nip dari database
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password"));
        u.setRole(role);

        return u;
    }
}