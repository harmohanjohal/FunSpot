package services.util;

import org.json.JSONObject;

/**
 * Utilities for standardized error handling
 */
public class ErrorUtils {

    /**
     * Create a standard error response
     * 
     * @param errorMessage Error message to include
     * @return JSON string with error details
     */
    public static String createErrorResponse(String errorMessage) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", errorMessage);

        // Log the error to console
        System.err.println("ERROR: " + errorMessage);

        return response.toString();
    }

    /**
     * Create a standard error response from an exception
     * 
     * @param e Exception that occurred
     * @return JSON string with error details
     */
    public static String createErrorResponse(Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", "An internal error occurred.");

        // Log the actual error to console for serverside debugging
        System.err.println("INTERNAL ERROR: " + (e != null ? e.getMessage() : "Unknown"));

        return response.toString();
    }

    /**
     * Create a standard error response with custom message and exception details
     * 
     * @param message Custom error message
     * @param e       Exception that occurred
     * @return JSON string with error details
     */
    public static String createErrorResponse(String message, Exception e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", message);

        // Log the detailed error to console for serverside debugging
        System.err.println("ERROR: " + message + ": " + (e != null ? e.getMessage() : "Unknown"));

        return response.toString();
    }

    /**
     * Validate that a value is not null
     * 
     * @param value     Value to check
     * @param fieldName Name of the field for error message
     * @return Error message or null if validation passes
     */
    public static String validateNotNull(Object value, String fieldName) {
        if (value == null) {
            return fieldName + " cannot be null";
        }
        return null;
    }

    /**
     * Validate that a string is not empty
     * 
     * @param value     String to check
     * @param fieldName Name of the field for error message
     * @return Error message or null if validation passes
     */
    public static String validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return fieldName + " cannot be empty";
        }
        return null;
    }

    /**
     * Validate that a number is positive
     * 
     * @param value     Number to check
     * @param fieldName Name of the field for error message
     * @return Error message or null if validation passes
     */
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