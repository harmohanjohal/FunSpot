package events.util;

public class EventAppException extends Exception {
    
    private ErrorType errorType;
    
    public enum ErrorType {
        VALIDATION_ERROR,
        NOT_FOUND_ERROR,
        SYSTEM_ERROR,
        API_ERROR,
        FILE_ERROR
    }
    
    // Constructor with message and error type
    public EventAppException(String message, ErrorType errorType) {
        super(message);
        this.errorType = errorType;
    }
    
    // Constructor with message, type, and root cause
    public EventAppException(String message, ErrorType errorType, Throwable cause) {
        super(message, cause);
        this.errorType = errorType;
    }
    
    public ErrorType getErrorType() {
        return errorType;
    }
}