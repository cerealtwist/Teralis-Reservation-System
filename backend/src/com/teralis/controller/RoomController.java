package com.teralis.controller;

import com.teralis.dao.RoomDAO;
import com.teralis.model.Room;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PathUtil;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/rooms/*")
public class RoomController extends HttpServlet {

    private final RoomDAO roomDAO = new RoomDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<Room> rooms = roomDAO.getAllRooms();
        JsonResponse.send(resp, rooms);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Room room = JsonResponse.readBody(req, Room.class);

        if (roomDAO.createRoom(room)) {
            JsonResponse.success(resp, "Room created");
        } else {
            JsonResponse.error(resp, 500, "Failed to create room");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int id = PathUtil.getIdFromUrl(req);

        Room updated = JsonResponse.readBody(req, Room.class);

        if (roomDAO.updateRoom(id, updated)) {
            JsonResponse.success(resp, "Room updated");
        } else {
            JsonResponse.error(resp, 500, "Failed to update room");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int id = PathUtil.getIdFromUrl(req);

        if (roomDAO.deleteRoom(id)) {
            JsonResponse.success(resp, "Room deleted");
        } else {
            JsonResponse.error(resp, 500, "Failed to delete room");
        }
    }
}
