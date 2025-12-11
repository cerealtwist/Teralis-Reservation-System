package com.teralis.model;

public class Room {
    private int id;
    private int buildingId;
    private String name;
    private String type;
    private int capacity;
    private String facilities;
    private String status; // available, maintenance

    public Room() {}

    public Room(int id, int buildingId, String name, String type, int capacity,
                String facilities, String status) {
        this.id = id;
        this.buildingId = buildingId;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.facilities = facilities;
        this.status = status;
    }

    // Getters & Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(int buildingId) {
        this.buildingId = buildingId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getFacilities() {
        return facilities;
    }

    public void setFacilities(String facilities) {
        this.facilities = facilities;
    }

    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
