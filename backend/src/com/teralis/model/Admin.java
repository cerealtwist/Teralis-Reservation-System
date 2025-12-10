package com.teralis.model;

public class Admin extends User {
  public Admin() {
        this.role = "admin";
    }

    public Admin(int id, String name, String email, String password) {
        super(id, name, email, password, "admin");
    }
}
