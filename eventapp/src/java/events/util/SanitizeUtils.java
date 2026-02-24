package events.util;

/**
 * Utility for sanitizing user input to prevent XSS and other injection attacks
 */
public class SanitizeUtils {

    /**
     * Basic sanitization to strip HTML tags from a string
     * 
     * @param input Raw input string
     * @return Sanitized string
     */
    public static String sanitize(String input) {
        if (input == null) {
            return null;
        }

        // Remove common HTML tags
        String sanitized = input.replaceAll("<[^>]*>", "");

        // Escape special characters as an extra precaution
        sanitized = sanitized.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                .replace("/", "&#x2F;");

        return sanitized.trim();
    }
}
