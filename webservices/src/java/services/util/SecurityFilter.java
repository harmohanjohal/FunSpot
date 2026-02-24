package services.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.annotation.Priority;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.security.Key;
import java.nio.charset.StandardCharsets;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class SecurityFilter implements ContainerRequestFilter {

    private static final String AUTH_SCHEME = "Bearer";
    private static final String SECRET_KEY = System.getenv("JWT_SECRET") != null
            ? System.getenv("JWT_SECRET")
            : "soct_secret_key_2025";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // We protect POST methods for these internal services
        if (!requestContext.getMethod().equals("POST")) {
            return;
        }

        // Get Authorization header
        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

        // Validate Auth header
        if (authHeader == null || !authHeader.startsWith(AUTH_SCHEME + " ")) {
            abortWithUnauthorized(requestContext, "Missing or invalid Authorization header");
            return;
        }

        // Extract token
        String token = authHeader.substring(AUTH_SCHEME.length()).trim();

        try {
            // Validate Token
            Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);

        } catch (Exception e) {
            System.err.println("JWT Validation Error: " + e.getMessage());
            abortWithUnauthorized(requestContext, "Invalid or expired token");
        }
    }

    private void abortWithUnauthorized(ContainerRequestContext requestContext, String message) {
        requestContext.abortWith(Response
                .status(Response.Status.UNAUTHORIZED)
                .entity(ErrorUtils.createErrorResponse(message))
                .build());
    }
}
