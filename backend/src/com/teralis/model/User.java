package com.teralis.model;

public abstract class User {
    protected int id;
    protected String name;
    protected String nimNip;
    protected String email;
    protected String passwordHash;
    protected String role; // student, lecturer, admin

    public User() {}

    public User(int id, String nimNip, String name, String email, String passwordHash, String role){
        this.id = id;
        this.nimNip = nimNip;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // Abstract Method
    public abstract boolean canApproveReservation();
    
    // Getters & Setters
    public int getId(){
        return id;
    }

    public void setId(int id){
        this.id = id;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public String getPasswordHash(){
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash){
        this.passwordHash = passwordHash;
    }

    public String getRole(){
        return role;
    }

    public void setRole(String role){
        this.role = role;
    }

    public String getNimNip() {
        return nimNip;
    }

    public void setNimNip(String nimNip) {
        this.nimNip = nimNip;
    }
}
