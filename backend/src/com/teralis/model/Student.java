package com.teralis.model;

public class Student extends User {
    public Student(){
        this.role = "student";
    }

    public Student(int id, String name, String email, String passwordHash){
        super(id, name, email, passwordHash, "student");
    }

    @Override
    public boolean canApproveReservation() {
        return false; // student role cannot approve. (NOT AN ADMIN)
    }
}