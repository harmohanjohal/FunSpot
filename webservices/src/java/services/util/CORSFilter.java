package services.util;

import java.io.IOException;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.container.PreMatching;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;

/**
 * CORS filter for enabling cross-origin requests
 */
@Provider
@PreMatching
public class CORSFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String allowedOrigin = System.getenv("CORS_ALLOWED_ORIGIN") != null
                ? System.getenv("CORS_ALLOWED_ORIGIN")
                : "http://localhost:3000";
        // Handle pre-flight OPTIONS requests
        if (requestContext.getMethod().equals("OPTIONS")) {
            requestContext.abortWith(Response.status(Response.Status.OK)
                    .header("Access-Control-Allow-Origin", allowedOrigin)
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers",
                            "Origin, X-Requested-With, Content-Type, Accept, Authorization")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Max-Age", "3600")
                    .build());
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext)
            throws IOException {
        String allowedOrigin = System.getenv("CORS_ALLOWED_ORIGIN") != null
                ? System.getenv("CORS_ALLOWED_ORIGIN")
                : "http://localhost:3000";
        // Add CORS headers to all responses
        responseContext.getHeaders().add("Access-Control-Allow-Origin", allowedOrigin);
        responseContext.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        responseContext.getHeaders().add("Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
    }
}