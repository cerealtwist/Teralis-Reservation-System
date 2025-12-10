package com.teralis.utils;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;

public class AuthFilter implements Filter{
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // allow to login to endpoint without session
        String path = req.getRequestURI();

        if (path.endsWith("/api/auth/login")) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = req.getSession(false);

        boolean isAuth = (session != null && session.getAttribute("userId") != null);

        if (!isAuth) {
            JsonResponse.error(resp, 401, "Authentication required");
            return;
        }

        chain.doFilter(request, response);
    }
}
