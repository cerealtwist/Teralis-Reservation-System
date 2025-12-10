package com.teralis.model;

public class Admin extends User {
  public Admin() {
        this.role = "admin";
    }

    public Admin(int id, String name, String email, String passwordHash) {
        super(id, name, email, passwordHash, "admin");
    }
}
