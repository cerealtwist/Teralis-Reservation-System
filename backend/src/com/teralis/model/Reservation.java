package com.teralis.model;

import java.sql.Time;
import java.sql.Date;

public class Reservation {

    private int id;
    private int userId;
    private int roomId;
    private Date date;
    private Time startTime;
    private Time endTime;
    private String status;    // pending, approved, rejected
    private String reason;
    private String userName;
    private String userRole;
    private String documentPath;
    private String roomName;
    private String buildingName;
    private String roomImage;

    public Reservation() {}

    public Reservation(int id, int userId, int roomId, Date date,
                       Time startTime, Time endTime, String status, String reason, String documentPath) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.reason = reason;
        this.documentPath = documentPath;
    }

    // Getters & Setters
    public int getId() {
        return id;
    }

    public void setId(int id) { this.id = id; }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getRoomId() {
        return roomId;
    }

    public void setRoomId(int roomId) {
        this.roomId = roomId;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Time getStartTime() {
        return startTime;
    }

    public void setStartTime(Time startTime) {
        this.startTime = startTime;
    }

    public Time getEndTime() {
        return endTime;
    }

    public void setEndTime(Time endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getUserName(){
        return userName;
    }

    public void setUserName(String userName){
        this.userName = userName;
    }

    public String getUserRole(){
        return userRole;
    }

    public void setUserRole(String userRole){
        this.userRole = userRole;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    public String getRoomImage() { return roomImage; }
    public void setRoomImage(String roomImage) { this.roomImage = roomImage; }

}
