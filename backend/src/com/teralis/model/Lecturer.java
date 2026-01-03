package com.teralis.model;

public class Lecturer extends User {
    public Lecturer() {
        this.role = "lecturer";
    }
    public Lecturer(int id, String nimNip, String nama, String email, String password) {
        super(id, nimNip, nama, email, password, "lecturer");
    }

    @Override
    public boolean canApproveReservation() {
        return false; // lecturer role cannot approve. (NOT AN ADMIN)
    }
}