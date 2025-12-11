package com.teralis.model;

// Interface
interface IReservasi {
    void konfirmasi();
    void batal();
}

public class Reservation implements IReservasi {

    // Atribut
    private int idReservasi;
    private String tanggal;
    private String waktuMulai;
    private String waktuSelesai;
    private String status;
    private int idUser;
    private int idRoom;

    // Constructor
    public Reservation() {}

    public Reservation(int idReservasi, String tanggal, String waktuMulai,
                       String waktuSelesai, String status, int idUser, int idRoom) {
        this.idReservasi = idReservasi;
        this.tanggal = tanggal;
        this.waktuMulai = waktuMulai;
        this.waktuSelesai = waktuSelesai;
        this.status = status;
        this.idUser = idUser;
        this.idRoom = idRoom;
    }
  
    // Getter & Setter
    public int getIdReservasi() { 
        return idReservasi; 
    }

    public void setIdReservasi(int idReservasi) { 
        this.idReservasi = idReservasi; 
    }

    public String getTanggal() { 
        return tanggal; 
    }

    public void setTanggal(String tanggal) { 
        this.tanggal = tanggal; 
    }

    public String getWaktuMulai() { 
        return waktuMulai; 
    }

    public void setWaktuMulai(String waktuMulai) { 
        this.waktuMulai = waktuMulai; 
    }

    public String getWaktuSelesai() { 
        return waktuSelesai; 
    }

    public void setWaktuSelesai(String waktuSelesai) { 
        this.waktuSelesai = waktuSelesai; 
    }

    public String getStatus() { 
        return status; 
    }

    public void setStatus(String status) { 
        this.status = status; 
    }

    public int getIdUser() { 
        return idUser; 
    }

    public void setIdUser(int idUser) { 
        this.idUser = idUser; 
    }

    public int getIdRoom() { 
        return idRoom; 
    }

    public void setIdRoom(int idRoom) { 
        this.idRoom = idRoom; 
    }

    // Implementasi Interface
    @Override
    public void konfirmasi() {
        this.status = "Dikonfirmasi";
    }

    @Override
    public void batal() {
        this.status = "Dibatalkan";
    }
}
