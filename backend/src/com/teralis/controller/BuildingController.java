package com.teralis.controller;

import com.teralis.dao.BuildingDAO;
import com.teralis.model.Building;
import com.teralis.utils.JsonResponse;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/buildings/*")
public class BuildingController extends HttpServlet {

    private final BuildingDAO buildingDAO = new BuildingDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<Building> list = buildingDAO.getActiveBuildings(); 
        JsonResponse.send(resp, list);
    }
}
