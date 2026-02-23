package events.util;

import org.json.JSONObject;
import events.util.EventAppException;

public class ErrorHandler {

    public static String createErrorResponse(EventAppException e) {
        JSONObject response = new JSONObject();
        response.put("success", false);
        response.put("error", true);
        response.put("message", e.getMessage());
        response.put("errorType", e.getErrorType().toString());

        // Set HTTP status code based on error type
        int statusCode = 500;

        switch (e.getErrorType()) {
            case VALIDATION_ERROR:
                statusCode = 400; // Bad Request
                break;
            case NOT_FOUND_ERROR:
                statusCode = 404; // Not Found
                break;
            case API_ERROR:
                statusCode = 502; // Bad Gateway
                break;
            case FILE_ERROR:
            case SYSTEM_ERROR:
                statusCode = 500; // Internal Server Error
                break;
        }

        response.put("statusCode", statusCode);

        System.err.println("ERROR [" + e.getErrorType() + "]: " + e.getMessage());
        if (e.getCause() != null) {
            System.err.println("Caused by: " + e.getCause().getMessage());
        }

        return response.toString();
    }

    // Create a JSON error response from a generic Exception
    public static String createErrorResponse(Exception e) {
        // Convert normal exception to our special EventAppException

        EventAppException appEx = new EventAppException(
                "Unexpected error: " + e.getMessage(),
                EventAppException.ErrorType.SYSTEM_ERROR,
                e);

        return createErrorResponse(appEx);
    }
}
