package com.teralis.utils;

import javax.servlet.http.HttpServletRequest;

public class PathUtil {

    public static int getIdFromUrl(HttpServletRequest req) {
        String path = req.getPathInfo(); // "/17"
        if (path == null || path.length() <= 1) return -1;

        try {
            return Integer.parseInt(path.substring(1));
        } catch (Exception e) {
            return -1;
        }
    }
}
