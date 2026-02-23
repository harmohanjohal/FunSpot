package util;

import java.io.IOException;
import javax.ws.rs.container.*;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;

@Provider
@PreMatching
public class CORSFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String allowedOrigin = System.getenv("CORS_ALLOWED_ORIGIN") != null
                ? System.getenv("CORS_ALLOWED_ORIGIN")
                : "*";
        // Handle pre-flight OPTIONS requests
        if (requestContext.getMethod().equals("OPTIONS")) {
            requestContext.abortWith(Response.status(Response.Status.OK)
                    .header("Access-Control-Allow-Origin", allowedOrigin)
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
                    .build());
        }
    }

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext)
            throws IOException {
        String allowedOrigin = System.getenv("CORS_ALLOWED_ORIGIN") != null
                ? System.getenv("CORS_ALLOWED_ORIGIN")
                : "*";
        // Add CORS headers to all responses
        responseContext.getHeaders().add("Access-Control-Allow-Origin", allowedOrigin);
        responseContext.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        responseContext.getHeaders().add("Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept");
    }
}