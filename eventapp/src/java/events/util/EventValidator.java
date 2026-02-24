package events.util;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import events.model.Event;

public class EventValidator {

    // Class to hold validation results
    public static class ValidationResult {

        private boolean valid;
        private List<String> errors;

        public ValidationResult() {
            this.valid = true;
            this.errors = new ArrayList<>();
        }

        public void addError(String error) {
            this.valid = false;
            this.errors.add(error);
        }

        public boolean isValid() {
            return valid;
        }

        // Get all errors
        public List<String> getErrors() {
            return errors;
        }

        // Get all errors as a single string
        public String getErrorMessage() {
            return String.join(", ", errors);
        }
    }

    public static ValidationResult validateEvent(Event event) {
        ValidationResult result = new ValidationResult();

        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            result.addError("Title cannot be empty");
        } else {
            // Sanitize title
            event.setTitle(SanitizeUtils.sanitize(event.getTitle()));

            if (event.getTitle().length() < 5) {
                result.addError("Title must be at least 5 characters");
            } else if (event.getTitle().length() > 100) {
                result.addError("Title cannot exceed 100 characters");
            }
        }

        if (event.getEventType() == null || event.getEventType().trim().isEmpty()) {
            result.addError("Event type cannot be empty");
        }

        if (event.getDate() == null) {
            result.addError("Event date cannot be empty");
        } else if (event.getDate().isBefore(LocalDateTime.now())) {
            result.addError("Event date must be in the future");
        }

        if (event.getLocation() == null || event.getLocation().trim().isEmpty()) {
            result.addError("Location cannot be empty");
        } else {
            event.setLocation(SanitizeUtils.sanitize(event.getLocation()));
        }

        if (event.getCity() == null || event.getCity().trim().isEmpty()) {
            result.addError("City cannot be empty");
        } else {
            event.setCity(SanitizeUtils.sanitize(event.getCity()));
        }

        if (event.getPostcode() == null || event.getPostcode().trim().isEmpty()) {
            result.addError("Postcode cannot be empty");
        } else if (!isValidPostcode(event.getPostcode())) {
            result.addError("Invalid postcode format");
        }

        if (event.getTotalTickets() <= 0) {
            result.addError("Total tickets must be greater than zero");
        }

        if (event.getTicketPrice() < 0) {
            result.addError("Ticket price cannot be negative");
        }

        return result;
    }

    // Check if postcode has a valid format
    private static boolean isValidPostcode(String postcode) {
        if (postcode == null || postcode.trim().isEmpty()) {
            return false;
        }

        if (postcode.length() > 10) {
            return false;
        }
        // Should only have letters, numbers, and spaces
        return postcode.matches("^[a-zA-Z0-9 ]+$");
    }
}
