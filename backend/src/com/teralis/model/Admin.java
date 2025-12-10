package com.teralis.model;

public class Admin extends User {
    private int idAdmin;

    // Constructor Kosong
    public Admin() {
        super();
    }

    public Admin(int idUser, String nama, String username, String password, int idAdmin) {
        super(idUser, nama, username, password);
        this.idAdmin = idAdmin;
    }

    public int getIdAdmin() {
        return idAdmin;
    }

    public void setIdAdmin(int idAdmin) {
        this.idAdmin = idAdmin;
    }
    
    @Override
    public String toString() {
        return "Admin{" +
                "idAdmin=" + idAdmin +
                ", idUser=" + idUser +
                ", nama='" + nama + '\'' +
                ", username='" + username + '\'' +
                '}';
    }
}
