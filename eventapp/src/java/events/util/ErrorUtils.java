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
        response.put("error", e.getMessage());
        
        // Log the error to console
        System.err.println("ERROR: " + e.getMessage());
        e.printStackTrace();
        
        return response.toString();
    }
    
    // Create a JSON error response with custom message plus exception
    public static String createErrorResponse(String message, Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", message + ": " + e.getMessage());
        
        // Log the error to console
        System.err.println("ERROR: " + message + ": " + e.getMessage());
        e.printStackTrace();
        
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