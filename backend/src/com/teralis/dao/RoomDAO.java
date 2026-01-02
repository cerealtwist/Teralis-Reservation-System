package com.teralis.dao;

import com.teralis.model.Room;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {

    /**
     * AMBIL SEMUA RUANGAN + JOIN GEDUNG
     * Memperbaiki masalah "Gedung Undefined" di tabel dashboard
     */
    public List<Room> getAllRooms() {
        List<Room> list = new ArrayList<>();
        // Gunakan JOIN untuk mengambil nama gedung
        String sql = "SELECT r.*, b.name AS building_name " +
                     "FROM rooms r " +
                     "JOIN buildings b ON r.building_id = b.id " +
                     "ORDER BY r.id DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            while (rs.next()) {
                Room r = mapToRoom(rs);
                // Set nama gedung dari hasil JOIN
                r.setBuildingName(rs.getString("building_name"));
                list.add(r);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public Room getRoomById(int id) {
        // USE JOIN (AMBIL NAMA GEDUNG)
        String sql = "SELECT r.*, b.name AS building_name " +
                     "FROM rooms r " +
                     "JOIN buildings b ON r.building_id = b.id " +
                     "WHERE r.id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, id);
            ResultSet rs = statement.executeQuery();

            if (rs.next()) {
                Room r = mapToRoom(rs);
                r.setBuildingName(rs.getString("building_name"));
                return r;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean createRoom(Room r) {
        String sql = "INSERT INTO rooms (building_id, name, type, capacity, facilities, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, r.getBuildingId());
            statement.setString(2, r.getName());
            statement.setString(3, r.getType() != null ? r.getType() : "General");
            statement.setInt(4, r.getCapacity());
            statement.setString(5, r.getFacilities() != null ? r.getFacilities() : "");
            statement.setString(6, r.getStatus() != null ? r.getStatus() : "available");
            statement.setString(7, r.getImageUrl());

            return statement.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * UPDATE RUANGAN
     * Memperbaiki masalah gambar tidak terupdate dan SQL Error
     */
    public boolean updateRoom(int id, Room r) {
        // Update semua kolom termasuk image_url
        String sql = "UPDATE rooms SET building_id=?, name=?, type=?, capacity=?, facilities=?, status=?, image_url=? WHERE id=?";

        try (Connection conn = DBConnection.getConnection();
            PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, r.getBuildingId());
            statement.setString(2, r.getName());
            statement.setString(3, r.getType());
            statement.setInt(4, r.getCapacity());
            statement.setString(5, r.getFacilities());
            statement.setString(6, r.getStatus());
            statement.setString(7, r.getImageUrl());
            statement.setInt(8, id);

            return statement.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteRoom(int id) {
        String sql = "DELETE FROM rooms WHERE id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * AMBIL RUANGAN PER GEDUNG (Untuk Student)
     */
    public List<Room> getRoomsByBuilding(int buildingId) {
        List<Room> list = new ArrayList<>();
        String sql = "SELECT r.*, b.name AS building_name " +
                     "FROM rooms r " +
                     "JOIN buildings b ON r.building_id = b.id " +
                     "WHERE r.building_id = ? AND r.status = 'available'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, buildingId);
            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                Room r = mapToRoom(rs);
                r.setBuildingName(rs.getString("building_name"));
                list.add(r);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * MAPPING RESULTSET KE OBJECT ROOM
     */
    private Room mapToRoom(ResultSet rs) throws SQLException {
        Room r = new Room();
        r.setId(rs.getInt("id"));
        r.setBuildingId(rs.getInt("building_id"));
        r.setName(rs.getString("name"));
        r.setType(rs.getString("type"));
        r.setCapacity(rs.getInt("capacity"));
        r.setFacilities(rs.getString("facilities"));
        r.setStatus(rs.getString("status"));
        r.setImageUrl(rs.getString("image_url"));
        return r;
    }
}