// Simple utility methods for error handling
package events.util;

import org.json.JSONObject;

public class ErrorUtils {

    // Create a JSON error response with a message
    public static String createErrorResponse(String errorMessage) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", errorMessage);

        // Log the error to console
        System.err.println("ERROR: " + errorMessage);

        return response.toString();
    }

    // Create a JSON error response from an exception
    public static String createErrorResponse(Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        // Do not expose detailed internal messages to the client
        response.put("error", "An internal error occurred.");

        // Log the actual error to console for serverside debugging
        System.err.println("INTERNAL ERROR: " + e.getMessage());

        return response.toString();
    }

    // Create a JSON error response with custom message plus exception
    public static String createErrorResponse(String message, Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", message);

        // Log the detailed error to console for serverside debugging
        System.err.println("ERROR: " + message + ": " + e.getMessage());

        return response.toString();
    }

    // Check if a value is not null
    public static String validateNotNull(Object value, String fieldName) {
        if (value == null) {
            return fieldName + " cannot be null";
        }
        return null;
    }

    // Check if a string is not empty
    public static String validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return fieldName + " cannot be empty";
        }
        return null;
    }

    // Check if a number is positive
    public static String validatePositive(Number value, String fieldName) {
        if (value == null) {
            return fieldName + " cannot be null";
        }

        if (value.doubleValue() <= 0) {
            return fieldName + " must be positive";
        }

        return null;
    }
}