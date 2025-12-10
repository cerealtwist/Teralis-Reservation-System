package com.teralis.dao;

import com.teralis.model.*;
import java.sql.*;

public class UserDAO {
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
        String sql = "SELECT * FROM users Where id = ?";
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

    public boolean createUser(User u){
        String sql = "INSERT INTO users(name, email, password, role) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
            PreparedStatement statement = conn.prepareStatement(sql)){
                statement.setString(1, u.getName());
                statement.setString(2, u.getEmail());
                statement.setString(3, u.getPassword());
                statement.setString(4, u.getRole());
                
                return statement.executeUpdate() > 0;

        } catch(Exception e){
            e.printStackTrace();
        }

        return false;
    }

    private User mapToUser(ResultSet rs) throws SQLException{
        String role = rs.getString("role");
        User u = null;

        switch (role) {
            case "student":
                u = new Student();
                break;
            case "lecturer":
                //u = new Lecturer(); <- NOT IMPLEMENTED
                break;
            case "admin":
                //u = new Admin(); <- NOT IMPLEMENTED
                break;
            default:
                throw new IllegalStateException("Unknown user role: " + role);
        }

        u.setId(rs.getInt("id"));
        u.setName(rs.getString("name"));
        u.setEmail(rs.getString("email"));
        u.setPassword(rs.getString("password"));
        u.setRole(role);

        return u;
    }
}
