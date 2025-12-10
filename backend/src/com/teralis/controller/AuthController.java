package com.teralis.controller;

import com.teralis.dao.UserDAO;
import com.teralis.model.User;
import com.teralis.utils.JsonResponse;
import com.teralis.utils.PasswordHash;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;


public class AuthController extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    
}