package com.teralis.model;

public class Lecturer extends User {
    public Lecturer() {
        this.role = "lecturer";
    }
    public Lecturer(int id, String nama, String email, String password) {
        super(id, nama, email, password, "lecturer");
    }

    @Override
    public boolean canApproveReservation() {
        return false; // lecturer role cannot approve. (NOT AN ADMIN)
    }
}