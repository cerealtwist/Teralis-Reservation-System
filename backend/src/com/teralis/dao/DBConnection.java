package com.teralis.dao;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static Connection conn;
    private static final String URL = "jdbc:mysql://localhost:3306/teralis?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASS = "oplibroot123";

    public static Connection getConnection() throws SQLException {
        try {
            if (conn == null || conn.isClosed()){
                Class.forName("com.mysql.cj.jdbc.Driver");
                conn = DriverManager.getConnection(URL, USER, PASS);
            }
            return conn;
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL Driver not found", e);
        }
    }
}
