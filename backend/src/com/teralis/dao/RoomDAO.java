package com.teralis.dao;

import com.teralis.model.Room;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {

    public List<Room> getAllRooms() {
        List<Room> list = new ArrayList<>();

        String sql = "SELECT * FROM rooms ORDER BY id DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            while (rs.next()) {
                list.add(mapToRoom(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public Room getRoomById(int id) {
        String sql = "SELECT * FROM rooms WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, id);

            ResultSet rs = statement.executeQuery();

            if (rs.next()) return mapToRoom(rs);

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
            statement.setString(3, r.getType());
            statement.setInt(4, r.getCapacity());
            statement.setString(5, r.getFacilities());
            statement.setString(6, r.getStatus());
            statement.setString(7, r.getImageUrl());

            return statement.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    public boolean updateRoom(int id, Room r) {
        String sql = "UPDATE rooms SET building_id=?, name=?, type=?, capacity=?, facilities=?, status=? WHERE id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, r.getBuildingId());
            statement.setString(2, r.getName());
            statement.setString(3, r.getType());
            statement.setInt(4, r.getCapacity());
            statement.setString(5, r.getFacilities());
            statement.setString(6, r.getStatus());
            statement.setInt(7, id);

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

    public List<Room> getRoomsByBuilding(int buildingId) {
        List<Room> list = new ArrayList<>();

        String sql = "SELECT * FROM rooms WHERE building_id = ? AND status = 'available'";

        try (Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, buildingId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(mapToRoom(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return list;
    }

}
