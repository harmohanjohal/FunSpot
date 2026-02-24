package events.util;

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
    private static final String SECRET_KEY = ConfigLoader.getProperty("JWT_SECRET",
            "soct_secret_key_2025_must_be_at_least_32_bytes_long_for_security_123456789");

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();
        String method = requestContext.getMethod();

        System.err.println("[SECURITY] Checking request: " + method + " " + path);

        // Allow OPTIONS requests for CORS preflight
        if (method.equals("OPTIONS")) {
            System.err.println("[SECURITY] Allowing OPTIONS preflight request");
            return;
        }

        // Only protect booking and cancellation endpoints for now as per requirement
        if (!path.contains("/book") && !path.contains("/cancel") && !method.equals("POST")) {
            System.err.println("[SECURITY] Path not protected, allowing access");
            return;
        }

        System.err.println("[SECURITY] Path is protected. Checking for Authorization header.");

        // Get Authorization header
        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        System.err.println("[SECURITY] Auth Header Received: "
                + (authHeader != null ? "Yes (length " + authHeader.length() + ")" : "NULL"));

        // Validate Auth header
        if (authHeader == null || !authHeader.startsWith(AUTH_SCHEME + " ")) {
            System.err.println("[SECURITY] Missing or invalid Authorization header format");
            abortWithUnauthorized(requestContext, "Missing or invalid Authorization header");
            return;
        }

        // Extract token
        String token = authHeader.substring(AUTH_SCHEME.length()).trim();
        System.err.println("[SECURITY] Extracted Token: " + token.substring(0, Math.min(10, token.length())) + "...");

        try {
            // Validate Token
            Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Set user context if needed
            requestContext.setProperty("auth_user", claims.getSubject());
            requestContext.setProperty("auth_role", claims.get("role"));
            System.err.println("[SECURITY] Token validation SUCCESS for user: " + claims.getSubject());

        } catch (Exception e) {
            System.err.println("[SECURITY] JWT Validation Error Details: " + e.getMessage());
            abortWithUnauthorized(requestContext, "Invalid or expired token: " + e.getMessage());
        }
    }

    private void abortWithUnauthorized(ContainerRequestContext requestContext, String message) {
        requestContext.abortWith(Response
                .status(Response.Status.UNAUTHORIZED)
                .entity(ErrorUtils.createErrorResponse(message))
                .build());
    }
}
