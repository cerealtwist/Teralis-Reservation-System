package com.teralis.model;

public class Student extends User {
    public Student(){
        this.role = "student";
    }

    public Student(int id, String name, String email, String password){
        super(id, name, email, password, "student");
    }
}