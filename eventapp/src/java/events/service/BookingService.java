package events.service;

import org.json.JSONObject;
import events.model.Event;
import events.util.ErrorUtils;

public class BookingService {

    private final EventRepository repository;

    // Constructor needs the event repository to find events
    public BookingService(EventRepository repository) {
        this.repository = repository;
    }

    public String bookEvent(String eventId, int numTickets) {
        // Check if inputs are valid
        String idError = ErrorUtils.validateNotEmpty(eventId, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        String ticketsError = ErrorUtils.validatePositive(numTickets, "Number of tickets");
        if (ticketsError != null) {
            return ErrorUtils.createErrorResponse(ticketsError);
        }

        try {
            // Find the event
            Event event = repository.findEventById(eventId);
            if (event == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + eventId);
            }
            // To ensure there are enough tickets for booking
            if (event.getRemainingTickets() < numTickets) {
                return ErrorUtils.createErrorResponse(
                        "Not enough tickets available. Requested: " + numTickets
                        + ", Available: " + event.getRemainingTickets());
            }

            event.bookTickets(numTickets);
            repository.saveEvents();

            // Make a booking reference like "BOOK-AB12CD34"
            String bookingReference = "BOOK-" + generateRandomString(8);

            // Ticket booking successful response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", numTickets + " tickets booked successfully for " + event.getTitle());
            response.put("bookingReference", bookingReference);
            response.put("remainingTickets", event.getRemainingTickets());
            return response.toString();

        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error booking tickets", e);
        }
    }

    public String cancelBooking(String eventId, int numTickets) {
        String idError = ErrorUtils.validateNotEmpty(eventId, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        String ticketsError = ErrorUtils.validatePositive(numTickets, "Number of tickets");
        if (ticketsError != null) {
            return ErrorUtils.createErrorResponse(ticketsError);
        }

        try {
            Event event = repository.findEventById(eventId);
            if (event == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + eventId);
            }

            if (event.getBookedTickets() < numTickets) {
                return ErrorUtils.createErrorResponse(
                        "Cannot cancel more tickets than were booked. Requested: "
                        + numTickets + ", Booked: " + event.getBookedTickets());
            }

            // Update the booked tickets count to return tickets to available pool
            event.setBookedTickets(event.getBookedTickets() - numTickets);
            repository.saveEvents();

            //Ticket cancelled response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", numTickets + " tickets cancelled successfully for " + event.getTitle()
                    + ". Money will be sent back to your source account within 3-5 business days.");
            response.put("remainingTickets", event.getRemainingTickets());
            return response.toString();

        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error cancelling tickets", e);
        }
    }

    public String processRefund(String eventId, int numTickets, String bookingReference) {
        String idError = ErrorUtils.validateNotEmpty(eventId, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        String ticketsError = ErrorUtils.validatePositive(numTickets, "Number of tickets");
        if (ticketsError != null) {
            return ErrorUtils.createErrorResponse(ticketsError);
        }

        String bookingError = ErrorUtils.validateNotEmpty(bookingReference, "Booking reference");
        if (bookingError != null) {
            return ErrorUtils.createErrorResponse(bookingError);
        }

        try {
            Event event = repository.findEventById(eventId);
            if (event == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + eventId);
            }

            if (!bookingReference.matches("BOOK-[A-Z0-9]{8}")) {
                return ErrorUtils.createErrorResponse(
                        "Invalid booking reference format. Please provide a valid booking reference.");
            }

            if (event.getBookedTickets() < numTickets) {
                return ErrorUtils.createErrorResponse(
                        "Cannot refund more tickets than were booked. Requested: "
                        + numTickets + ", Booked: " + event.getBookedTickets());
            }

            // Update the booked tickets count to return tickets to available pool
            event.setBookedTickets(event.getBookedTickets() - numTickets);
            repository.saveEvents();

            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", "Refund processed successfully for " + numTickets
                    + " tickets. Money will be sent back to your source account within 3-5 business days.");
            response.put("remainingTickets", event.getRemainingTickets());
            return response.toString();

        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error processing refund", e);
        }
    }

    // Generate random string for booking references
    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}