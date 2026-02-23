// This class provides the REST API endpoints for the event system
package events.service;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.Produces;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.json.JSONArray;
import org.json.JSONObject;

import events.model.Event;
import events.model.SearchCriteria;
import events.util.ErrorUtils;
import events.util.EventValidator;
import events.util.JSONFieldValidator;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.PUT;

// REST API path is "api/events"
@Path("events")
public class EventService {

    // Base URLs for external services
    private static final String SERVICES_BASE_URL = System.getenv("WEBSERVICES_URL") != null
            ? System.getenv("WEBSERVICES_URL")
            : "http://localhost:8081/WebServices/api";

    private static final String IMAGES_SERVICES_BASE_URL = System.getenv("IMAGESERVICE_URL") != null
            ? System.getenv("IMAGESERVICE_URL")
            : "http://localhost:8081/ImageService/api";

    // Services used
    private final EventRepository repository;
    private final BookingService bookingService;
    private final CityInfoService cityInfoService = new CityInfoService();

    @Context
    private UriInfo context;

    // Constructor initializes services
    public EventService() {
        this.repository = new EventRepository();
        this.bookingService = new BookingService(repository);
    }

    // GET /api/events - returns all events
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getJson() {
        try {
            List<Event> events = repository.getAllEvents();
            JSONArray jsonArray = new JSONArray();

            for (Event event : events) {
                jsonArray.put(repository.eventToJson(event));
            }

            return jsonArray.toString();
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error retrieving events", e);
        }
    }

    // GET /api/events/details?id=XYZ - returns details for one event
    @GET
    @Path("details")
    @Produces(MediaType.APPLICATION_JSON)
    public String getEventDetails(@QueryParam("id") String id) {
        // Check if ID is valid
        String idError = ErrorUtils.validateNotEmpty(id, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        try {
            Event foundEvent = repository.findEventById(id);

            if (foundEvent != null) {
                return repository.eventToJson(foundEvent).toString();
            } else {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + id);
            }
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error retrieving event details", e);
        }
    }

    // POST /api/events/{id}/book?tickets=X - book tickets for an event
    @POST
    @Path("{id}/book")
    @Produces(MediaType.APPLICATION_JSON)
    public String bookEvent(
            @PathParam("id") String id,
            @QueryParam("tickets") Integer numTickets) {

        if (numTickets == null) {
            return ErrorUtils.createErrorResponse("Number of tickets is required");
        }

        // Use the booking service to handle it
        return bookingService.bookEvent(id, numTickets);
    }

    // POST /api/events/{id}/cancel?tickets=X - cancel booking for an event
    @POST
    @Path("{id}/cancel")
    @Produces(MediaType.APPLICATION_JSON)
    public String cancelEvent(
            @PathParam("id") String id,
            @QueryParam("tickets") Integer numTickets,
            @Context HttpServletRequest request) {

        if (numTickets == null) {
            return ErrorUtils.createErrorResponse("Number of tickets is required");
        }

        // Use the booking service to handle it
        return bookingService.cancelBooking(id, numTickets);
    }

    // GET /api/events/search - search for events with many filter options
    @GET
    @Path("search")
    @Produces(MediaType.APPLICATION_JSON)
    public String searchEvents(
            @QueryParam("title") String title,
            @QueryParam("eventType") String eventType,
            @QueryParam("startDate") String startDate,
            @QueryParam("endDate") String endDate,
            @QueryParam("location") String location,
            @QueryParam("city") String city,
            @QueryParam("minPrice") Double minPrice,
            @QueryParam("maxPrice") Double maxPrice,
            @QueryParam("minAgeRating") Integer minAgeRating,
            @QueryParam("maxAgeRating") Integer maxAgeRating,
            @QueryParam("hasFreeTickets") Boolean hasFreeTickets,
            @QueryParam("sortBy") String sortBy,
            @QueryParam("sortOrder") String sortOrder) {

        try {
            // Convert date strings to LocalDateTime objects if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;

            if (startDate != null && !startDate.isEmpty()) {
                try {
                    startDateTime = LocalDateTime.parse(startDate, EventRepository.DATE_FORMATTER);
                } catch (DateTimeParseException e) {
                    return ErrorUtils.createErrorResponse(
                            "Invalid start date format. Use ISO format (e.g., 2023-01-30T19:00:00)");
                }
            }

            if (endDate != null && !endDate.isEmpty()) {
                try {
                    endDateTime = LocalDateTime.parse(endDate, EventRepository.DATE_FORMATTER);
                } catch (DateTimeParseException e) {
                    return ErrorUtils.createErrorResponse(
                            "Invalid end date format. Use ISO format (e.g., 2023-01-30T19:00:00)");
                }
            }

            // Check if price range makes sense
            if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
                return ErrorUtils.createErrorResponse(
                        "Minimum price cannot be greater than maximum price");
            }

            // Check if age rating range makes sense
            if (minAgeRating != null && maxAgeRating != null && minAgeRating > maxAgeRating) {
                return ErrorUtils.createErrorResponse(
                        "Minimum age rating cannot be greater than maximum age rating");
            }

            // Create search criteria object
            SearchCriteria criteria = new SearchCriteria();
            criteria.setTitle(title);
            criteria.setEventType(eventType);
            criteria.setStartDate(startDateTime);
            criteria.setEndDate(endDateTime);
            criteria.setLocation(location);
            criteria.setCity(city);
            criteria.setMinPrice(minPrice);
            criteria.setMaxPrice(maxPrice);
            criteria.setMinAgeRating(minAgeRating);
            criteria.setMaxAgeRating(maxAgeRating);
            criteria.setHasFreeTickets(hasFreeTickets);
            criteria.setSortBy(sortBy);
            criteria.setSortOrder(sortOrder);

            // Do the search
            List<Event> results = repository.searchEventsByCriteria(criteria);

            // Convert results to JSON
            JSONArray jsonArray = new JSONArray();
            for (Event event : results) {
                jsonArray.put(repository.eventToJson(event));
            }

            // Create response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("count", results.size());
            response.put("events", jsonArray);

            return response.toString();

        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error searching for events", e);
        }
    }

    // GET /api/events/{id}/convertPrice?toCurrency=XYZ - convert event price to another currency
    @GET
    @Path("{id}/convertPrice")
    @Produces(MediaType.APPLICATION_JSON)
    public String convertEventPrice(
            @PathParam("id") String id,
            @QueryParam("toCurrency") String toCurrency) {

        // Check if inputs are valid
        String idError = ErrorUtils.validateNotEmpty(id, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        String currencyError = ErrorUtils.validateNotEmpty(toCurrency, "Target currency");
        if (currencyError != null) {
            return ErrorUtils.createErrorResponse(currencyError);
        }

        try {
            // Find the event
            Event event = repository.findEventById(id);
            if (event == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + id);
            }

            // Call the currency microservice
            String serviceUrl = SERVICES_BASE_URL + "/currency/convert"
                    + "?amount=" + event.getTicketPrice()
                    + "&from=" + event.getCurrency()
                    + "&to=" + toCurrency;

            URL url = new URL(serviceUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // Get response
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));

                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                return response.toString();
            } else {
                return ErrorUtils.createErrorResponse(
                        "Error calling currency service: HTTP " + responseCode);
            }
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error converting currency", e);
        }
    }

    // GET /api/events/{id}/directions - get directions to event venue
    @GET
    @Path("{id}/directions")
    @Produces(MediaType.APPLICATION_JSON)
    public String getDirectionsToEvent(
            @PathParam("id") String id,
            @QueryParam("fromAddress") String fromAddress,
            @QueryParam("mode") String mode) {

        // Check if inputs are valid
        String idError = ErrorUtils.validateNotEmpty(id, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        String addressError = ErrorUtils.validateNotEmpty(fromAddress, "Starting address");
        if (addressError != null) {
            return ErrorUtils.createErrorResponse(addressError);
        }

        try {
            // Find the event
            Event event = repository.findEventById(id);
            if (event == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + id);
            }

            // Build the URL to the directions microservice
            StringBuilder serviceUrl = new StringBuilder(SERVICES_BASE_URL);
            serviceUrl.append("/directions/venue");
            serviceUrl.append("?venueName=").append(URLEncoder.encode(event.getLocation(), "UTF-8"));

            if (event.getVenueAddress() != null && !event.getVenueAddress().isEmpty()) {
                serviceUrl.append("&venueAddress=").append(URLEncoder.encode(event.getVenueAddress(), "UTF-8"));
            }

            if (event.getCity() != null && !event.getCity().isEmpty()) {
                serviceUrl.append("&city=").append(URLEncoder.encode(event.getCity(), "UTF-8"));
            }

            if (event.getPostcode() != null && !event.getPostcode().isEmpty()) {
                serviceUrl.append("&postcode=").append(URLEncoder.encode(event.getPostcode(), "UTF-8"));
            }

            serviceUrl.append("&from=").append(URLEncoder.encode(fromAddress, "UTF-8"));

            if (mode != null && !mode.isEmpty()) {
                serviceUrl.append("&mode=").append(URLEncoder.encode(mode, "UTF-8"));
            }

            // Call the directions microservice
            URL url = new URL(serviceUrl.toString());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // Get response
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));

                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                return response.toString();
            } else {
                return ErrorUtils.createErrorResponse(
                        "Error calling directions service: HTTP " + responseCode);
            }
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error getting directions", e);
        }
    }

    // POST /api/events - create a new event
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    public String createEvent(String jsonInput) {
        try {
            // Check if we got any data
            if (jsonInput == null || jsonInput.trim().isEmpty()) {
                return ErrorUtils.createErrorResponse("Event data is required");
            }

            // Try to parse the JSON
            JSONObject eventJson;
            try {
                eventJson = new JSONObject(jsonInput);
            } catch (Exception e) {
                return ErrorUtils.createErrorResponse("Invalid JSON format: " + e.getMessage());
            }

            // List of fields that must be included
            String[] requiredFields = {
                "title",
                "eventType",
                "date",
                "location",
                "city",
                "totalTickets",
                "ticketPrice",
                "ageRating"
            };

            // Make sure all required fields exist
            String missingFieldsMessage = JSONFieldValidator.getMissingFieldsMessage(eventJson, requiredFields);
            if (missingFieldsMessage != null) {
                return ErrorUtils.createErrorResponse(missingFieldsMessage);
            }

            // Create event from JSON
            Event newEvent = repository.createEventFromJson(eventJson);
            if (newEvent == null) {
                return ErrorUtils.createErrorResponse(
                        "Invalid date format. Use ISO format (e.g., 2023-01-30T19:00:00)");
            }

            // Validate the event data
            EventValidator.ValidationResult validationResult = EventValidator.validateEvent(newEvent);
            if (!validationResult.isValid()) {
                return ErrorUtils.createErrorResponse("Validation failed: " + validationResult.getErrorMessage());
            }

            // Add the event to the repository
            repository.addEvent(newEvent);

            // Create success response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", "Event created successfully");
            response.put("eventId", newEvent.getEventId());
            return response.toString();

        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error creating event", e);
        }
    }

    // POST /api/events/{id}/refund - process refund for a booking
    @POST
    @Path("{id}/refund")
    @Produces(MediaType.APPLICATION_JSON)
    public String refundBooking(
            @PathParam("id") String id,
            @QueryParam("tickets") Integer numTickets,
            @QueryParam("bookingReference") String bookingReference) {

        if (numTickets == null) {
            return ErrorUtils.createErrorResponse("Number of tickets is required");
        }

        // Use the booking service to handle it
        return bookingService.processRefund(id, numTickets, bookingReference);
    }

    // PUT /api/events/update/{id} - update an existing event
    @PUT
    @Path("update/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public String updateEvent(@PathParam("id") String id, String jsonInput) {
        // Check if ID is valid
        String idError = ErrorUtils.validateNotEmpty(id, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        try {
            // Check if we got any data
            if (jsonInput == null || jsonInput.trim().isEmpty()) {
                return ErrorUtils.createErrorResponse("Event data is required");
            }

            // Try to parse the JSON
            JSONObject eventJson;
            try {
                eventJson = new JSONObject(jsonInput);
            } catch (Exception e) {
                return ErrorUtils.createErrorResponse("Invalid JSON format: " + e.getMessage());
            }

            // Find the event to update
            Event existingEvent = repository.findEventById(id);
            if (existingEvent == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + id);
            }

            // Update fields that are in the JSON
            if (eventJson.has("title")) {
                existingEvent.setTitle(eventJson.getString("title"));
            }

            if (eventJson.has("eventType")) {
                existingEvent.setEventType(eventJson.getString("eventType"));
            }

            if (eventJson.has("date")) {
                try {
                    existingEvent.setDate(LocalDateTime.parse(eventJson.getString("date"), EventRepository.DATE_FORMATTER));
                } catch (DateTimeParseException e) {
                    return ErrorUtils.createErrorResponse(
                            "Invalid date format. Use ISO format (e.g., 2023-01-30T19:00:00)");
                }
            }

            if (eventJson.has("location")) {
                existingEvent.setLocation(eventJson.getString("location"));
            }

            if (eventJson.has("city")) {
                existingEvent.setCity(eventJson.getString("city"));
            }

            if (eventJson.has("venueAddress")) {
                existingEvent.setVenueAddress(eventJson.getString("venueAddress"));
            }

            if (eventJson.has("description")) {
                existingEvent.setDescription(eventJson.getString("description"));
            }

            if (eventJson.has("totalTickets")) {
                existingEvent.setTotalTickets(eventJson.getInt("totalTickets"));
            }

            if (eventJson.has("ticketPrice")) {
                existingEvent.setTicketPrice(eventJson.getDouble("ticketPrice"));
            }

            if (eventJson.has("currency")) {
                existingEvent.setCurrency(eventJson.getString("currency"));
            }

            if (eventJson.has("durationMinutes")) {
                existingEvent.setDurationMinutes(eventJson.getInt("durationMinutes"));
            }

            // Validate the updated event
            EventValidator.ValidationResult validationResult = EventValidator.validateEvent(existingEvent);
            if (!validationResult.isValid()) {
                return ErrorUtils.createErrorResponse("Validation failed: " + validationResult.getErrorMessage());
            }

            // Save the updated events to storage
            repository.saveEvents();

            // Create success response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", "Event updated successfully");
            response.put("eventId", existingEvent.getEventId());
            return response.toString();

        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error updating event", e);
        }
    }

    // POST /api/events/{id}/cancelEvent - delete an event completely
    @POST
    @Path("{id}/cancelEvent")
    @Produces(MediaType.APPLICATION_JSON)
    public String cancelEntireEvent(@PathParam("id") String id) {
        // Check if ID is valid
        String idError = ErrorUtils.validateNotEmpty(id, "Event ID");
        if (idError != null) {
            return ErrorUtils.createErrorResponse(idError);
        }

        try {
            // Find the event
            Event event = repository.findEventById(id);
            if (event == null) {
                return ErrorUtils.createErrorResponse("Event not found with ID: " + id);
            }

            // Try to remove the event
            boolean removed = repository.removeEvent(id);

            if (removed) {
                // Create success response
                JSONObject response = new JSONObject();
                response.put("success", true);
                response.put("message", "Event '" + event.getTitle() + "' has been successfully cancelled");
                return response.toString();
            } else {
                return ErrorUtils.createErrorResponse("Failed to cancel the event");
            }
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error cancelling event", e);
        }
    }

    // GET /api/events/city-info - get interesting facts about a city
    @GET
    @Path("city-info")
    @Produces(MediaType.APPLICATION_JSON)
    public String getCityInfo(@QueryParam("city") String city) {
        // Check if city name is valid
        if (city == null || city.trim().isEmpty()) {
            return ErrorUtils.createErrorResponse("City name is required");
        }

        try {
            return cityInfoService.getCityFacts(city);
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error fetching city information", e);
        }
    }

    // GET /api/events/statistics - get statistics about all events
    @GET
    @Path("statistics")
    @Produces(MediaType.APPLICATION_JSON)
    public String getEventStatistics() {
        try {
            List<Event> allEvents = repository.getAllEvents();

            // Calculate statistics
            int totalEvents = allEvents.size();
            int upcomingEvents = 0;
            int pastEvents = 0;
            double avgTicketPrice = 0;
            int totalFreeEvents = 0;
            int totalTicketsAvailable = 0;
            int totalTicketsBooked = 0;

            LocalDateTime now = LocalDateTime.now();

            for (Event event : allEvents) {
                if (event.getDate().isAfter(now)) {
                    upcomingEvents++;
                } else {
                    pastEvents++;
                }

                avgTicketPrice += event.getTicketPrice();

                if (event.getTicketPrice() == 0) {
                    totalFreeEvents++;
                }

                totalTicketsAvailable += event.getTotalTickets();
                totalTicketsBooked += event.getBookedTickets();
            }

            // Calculate average ticket price
            if (totalEvents > 0) {
                avgTicketPrice /= totalEvents;
            }

            // Create statistics response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("totalEvents", totalEvents);
            response.put("upcomingEvents", upcomingEvents);
            response.put("pastEvents", pastEvents);
            response.put("averageTicketPrice", avgTicketPrice);
            response.put("freeEvents", totalFreeEvents);
            response.put("totalTicketsAvailable", totalTicketsAvailable);
            response.put("totalTicketsBooked", totalTicketsBooked);
            response.put("bookingRate", totalTicketsAvailable > 0
                    ? (double) totalTicketsBooked / totalTicketsAvailable * 100 : 0);

            return response.toString();
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error generating statistics", e);
        }
    }

    // GET /api/events/images/event - get images for events by type
    @GET
    @Path("images/event")
    @Produces(MediaType.APPLICATION_JSON)
    public String getEventImage(@QueryParam("type") String searchTerm) {
        JSONObject response = new JSONObject();

        // Check if search term is valid
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Search term is required");
            return response.toString();
        }

        try {
            // Make search term safe for URL
            String encodedSearchTerm = URLEncoder.encode(searchTerm, "UTF-8");

            // Build the URL to the images microservice
            StringBuilder serviceUrl = new StringBuilder(IMAGES_SERVICES_BASE_URL);
            serviceUrl.append("/images/event?type=").append(encodedSearchTerm);

            // Call the microservice
            URL url = new URL(serviceUrl.toString());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            // Get response
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Read the response
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));
                StringBuilder responseStr = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    responseStr.append(line);
                }
                reader.close();

                return responseStr.toString();
            } else {
                // Handle HTTP error
                response.put("success", false);
                response.put("error", "Error calling image service: HTTP " + responseCode);
            }
        } catch (MalformedURLException ex) {
            Logger.getLogger(EventService.class.getName()).log(Level.SEVERE, "Malformed URL", ex);
            response.put("success", false);
            response.put("error", "Invalid service URL: " + ex.getMessage());
        } catch (IOException ex) {
            Logger.getLogger(EventService.class.getName()).log(Level.SEVERE, "IO error", ex);
            response.put("success", false);
            response.put("error", "Error fetching image: " + ex.getMessage());
        } catch (Exception e) {
            Logger.getLogger(EventService.class.getName()).log(Level.SEVERE, "Unexpected error", e);
            response.put("success", false);
            response.put("error", "Unexpected error: " + e.getMessage());
        }

        return response.toString();
    }
}
