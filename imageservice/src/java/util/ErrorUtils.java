package util;

import org.json.JSONObject;

public class ErrorUtils {

    public static String createErrorResponse(String errorMessage) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", errorMessage);
        System.err.println("ERROR: " + errorMessage);
        return response.toString();
    }

    public static String createErrorResponse(Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", "An internal error occurred.");
        System.err.println("INTERNAL ERROR: " + (e != null ? e.getMessage() : "Unknown"));
        return response.toString();
    }

    public static String createErrorResponse(String message, Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", message);
        System.err.println("ERROR: " + message + ": " + (e != null ? e.getMessage() : "Unknown"));
        return response.toString();
    }

    public static String validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return fieldName + " cannot be empty";
        }
        return null;
    }
}
