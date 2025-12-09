package com.teralis.utils;

import com.google.gson.Gson;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;

public class JsonResponse {
    private static final Gson gson = new Gson();

    public static void send(HttpServletResponse resp, Object data) throws IOException{
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(gson.toJson(data));
    }

    public static void success(HttpServletResponse resp, String msg) throws IOException {
        send(resp, new ResponseMessage("success", msg));
    }

    public static void error(HttpServletResponse resp, int status, String msg) throws IOException {
        resp.setStatus(status);
        send(resp, new ResponseMessage("error", msg));
    }

    public static <T> T readBody(HttpServletRequest req, Class<T> clazz) throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = req.getReader();
        String line;

        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return gson.fromJson(sb.toString(), clazz);
    }

    private static class ResponseMessage {
        String status;
        String message;

        public ResponseMessage(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }
}
