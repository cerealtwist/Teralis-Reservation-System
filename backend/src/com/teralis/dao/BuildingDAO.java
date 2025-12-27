package com.teralis.dao;

import com.teralis.model.Building;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BuildingDAO {

    public List<Building> getAllBuildings() {
        List<Building> list = new ArrayList<>();
                String sql = """
            SELECT id, name, code, is_active
            FROM buildings
            WHERE is_active = true
            ORDER BY name ASC
        """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            while (rs.next()) {
                list.add(map(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public boolean create(Building b) {
        String sql = """
            INSERT INTO buildings (name, code, is_active)
            VALUES (?, ?, ?)
        """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setString(1, b.getName());
            statement.setString(2, b.getCode());
            statement.setBoolean(3, b.isActive());

            return statement.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    private Building map(ResultSet rs) throws SQLException {
        Building b = new Building();
        b.setId(rs.getInt("id"));
        b.setName(rs.getString("name"));
        b.setCode(rs.getString("code"));
        b.setActive(rs.getBoolean("is_active"));
        return b;
    }

    public List<Building> getActiveBuildings() {
    List<Building> list = new ArrayList<>();
    String sql = "SELECT id, name, code FROM buildings WHERE is_active = true ORDER BY name";

    try (Connection conn = DBConnection.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        while (rs.next()) {
            Building b = new Building();
            b.setId(rs.getInt("id"));
            b.setName(rs.getString("name"));
            b.setCode(rs.getString("code"));
            list.add(b);
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return list;
}

}
