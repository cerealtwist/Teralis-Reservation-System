package com.teralis.dao;

import com.teralis.model.Building;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BuildingDAO {

    public List<Building> getAllBuildings() {
        List<Building> list = new ArrayList<>();
        String sql = "SELECT * FROM buildings ORDER BY name ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            while (rs.next()) {
                list.add(mapToBuilding(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public boolean create(Building b) {
        String sql = "INSERT INTO buildings(name, location, description) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setString(1, b.getName());
            statement.setString(2, b.getLocation());
            statement.setString(3, b.getDescription());

            return statement.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    private Building mapToBuilding(ResultSet rs) throws SQLException {
        return new Building(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getString("location"),
            rs.getString("description")
        );
    }
}
