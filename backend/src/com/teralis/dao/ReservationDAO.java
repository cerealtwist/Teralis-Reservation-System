package com.teralis.dao;

import com.teralis.model.Reservation;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReservationDAO {

    public boolean create(Reservation r) {
        String sql = "INSERT INTO reservations (user_id, room_id, date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, r.getUserId());
            statement.setInt(2, r.getRoomId());
            statement.setDate(3, r.getDate());
            statement.setTime(4, r.getStartTime());
            statement.setTime(5, r.getEndTime());
            statement.setString(6, r.getReason());

            return statement.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    public List<Reservation> getByUser(int userId) {
        List<Reservation> list = new ArrayList<>();
        String sql = "SELECT * FROM reservations WHERE user_id = ? ORDER BY date DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setInt(1, userId);

            ResultSet rs = statement.executeQuery();

            while (rs.next()) {
                list.add(map(rs));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public List<Reservation> getAll() {
        List<Reservation> list = new ArrayList<>();
        String sql = "SELECT * FROM reservations ORDER BY created_at DESC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            while (rs.next()) list.add(map(rs));

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public boolean updateStatus(int id, String status) {
        String sql = "UPDATE reservations SET status=? WHERE id=?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement statement = conn.prepareStatement(sql)) {

            statement.setString(1, status);
            statement.setInt(2, id);

            return statement.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    private Reservation map(ResultSet rs) throws SQLException {
        Reservation r = new Reservation();

        r.setId(rs.getInt("id"));
        r.setUserId(rs.getInt("user_id"));
        r.setRoomId(rs.getInt("room_id"));
        r.setDate(rs.getDate("date"));
        r.setStartTime(rs.getTime("start_time"));
        r.setEndTime(rs.getTime("end_time"));
        r.setStatus(rs.getString("status"));
        r.setReason(rs.getString("reason"));

        return r;
    }

    public boolean isTimeSlotAvailable(int roomId, Date date, Time start, Time end) {
    String sql = """
        SELECT COUNT(*) FROM reservations
        WHERE room_id = ?
        AND date = ?
        AND status = 'approved'
        AND (
            (start_time < ? AND end_time > ?)
        )
    """;

    try (Connection conn = DBConnection.getConnection();
         PreparedStatement statement = conn.prepareStatement(sql)) {

        statement.setInt(1, roomId);
        statement.setDate(2, date);
        statement.setTime(3, end);
        statement.setTime(4, start);

        ResultSet rs = statement.executeQuery();
        if (rs.next()) {
            return rs.getInt(1) == 0;
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}

}
