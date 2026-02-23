// Class for saving and loading events
package events.service;

import org.json.JSONArray;
import org.json.JSONObject;

import events.model.Event;
import events.model.SearchCriteria;
import events.util.EventValidator;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class EventRepository {

    private static final String JSON_FILE_PATH = System.getenv("JSON_FILE_PATH") != null
            ? System.getenv("JSON_FILE_PATH")
            : "G:\\Term 2\\SOCM\\EventApp\\Events.json";
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private List<Event> events;

    // Constructor
    public EventRepository() {
        loadEvents();
    }

    // Load events from file
    private void loadEvents() {
        events = new ArrayList<Event>();
        File file = new File(JSON_FILE_PATH);

        if (file.exists()) {
            try {
                String content = new String(Files.readAllBytes(Paths.get(JSON_FILE_PATH)));

                // Check if file is empty
                if (content == null || content.trim().isEmpty()) {
                    System.out.println("JSON file exists but is empty. Creating a new events list.");
                    return;
                }

                try {
                    JSONArray jsonArray = new JSONArray(content);
                
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject jsonEvent = jsonArray.getJSONObject(i);
                        try {
                            events.add(jsonToEvent(jsonEvent));
                        } catch (Exception e) {
                            System.err.println("Error parsing event #" + i + ": " + e.getMessage());
                            // Skip this event if there's an error
                        }
                    }

                    System.out.println("Loaded " + events.size() + " events from " + JSON_FILE_PATH);
                } catch (Exception e) {
                    System.err.println("Error parsing JSON content: " + e.getMessage());
                    e.printStackTrace();
                }
            } catch (IOException e) {
                System.err.println("Error loading events from JSON file: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("JSON file not found. Creating a new events list.");
        }
    }

    // Save events to file
    public void saveEvents() {
        try {
            JSONArray jsonArray = new JSONArray();

            for (Event event : events) {
                jsonArray.put(eventToJson(event));
            }

            FileWriter file = null;
            try {
                file = new FileWriter(JSON_FILE_PATH);
                file.write(jsonArray.toString(2));
                file.flush();
            } finally {
                if (file != null) {
                    file.close();
                }
            }

            System.out.println("Saved " + events.size() + " events to " + JSON_FILE_PATH);
        } catch (IOException e) {
            System.err.println("Error saving events to JSON file: " + e.getMessage());
            e.printStackTrace();
            throw new IllegalStateException("Failed to save events: " + e.getMessage());
        }
    }

    // Convert JSON to Event
    public Event jsonToEvent(JSONObject json) {
        // Check JSON
        if (json == null) {
            throw new IllegalArgumentException("JSON object cannot be null");
        }

        Event event = new Event();

        try {
            // Set fields from JSON
            event.setEventId(json.getString("eventId"));
            event.setTitle(json.getString("title"));
            event.setEventType(json.getString("eventType"));

            // Parse date
            String dateStr = json.getString("date");
            event.setDate(LocalDateTime.parse(dateStr, DATE_FORMATTER));

            event.setLocation(json.getString("location"));
            event.setCity(json.getString("city"));
            event.setTotalTickets(json.getInt("totalTickets"));
            event.setBookedTickets(json.getInt("bookedTickets"));
            event.setTicketPrice(json.getDouble("ticketPrice"));
            event.setAgeRating(json.getInt("ageRating"));

            // Optional fields
            if (json.has("venueAddress")) {
                event.setVenueAddress(json.getString("venueAddress"));
            }

            if (json.has("postcode")) {
                event.setPostcode(json.getString("postcode"));
            }

            if (json.has("currency")) {
                event.setCurrency(json.getString("currency"));
            }

            if (json.has("description")) {
                event.setDescription(json.getString("description"));
            }

            if (json.has("durationMinutes")) {
                event.setDurationMinutes(json.getInt("durationMinutes"));
            }

            return event;

        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format in event: " + e.getMessage());
        } catch (Exception e) {
            throw new IllegalArgumentException("Error parsing event JSON: " + e.getMessage());
        }
    }

    // Convert Event to JSON
    public JSONObject eventToJson(Event event) {
        // Check event
        if (event == null) {
            throw new IllegalArgumentException("Event object cannot be null");
        }

        JSONObject json = new JSONObject();

        try {
            // Add fields to JSON
            json.put("eventId", event.getEventId());
            json.put("title", event.getTitle());
            json.put("eventType", event.getEventType());
            json.put("date", event.getDate().format(DATE_FORMATTER));
            json.put("location", event.getLocation());
            json.put("city", event.getCity());
            json.put("totalTickets", event.getTotalTickets());
            json.put("bookedTickets", event.getBookedTickets());
            json.put("ticketPrice", event.getTicketPrice());
            json.put("currency", event.getCurrency());
            json.put("ageRating", event.getAgeRating());

            // Optional fields
            if (event.getVenueAddress() != null) {
                json.put("venueAddress", event.getVenueAddress());
            }

            if (event.getPostcode() != null) {
                json.put("postcode", event.getPostcode());
            }

            if (event.getDescription() != null) {
                json.put("description", event.getDescription());
            }

            if (event.getDurationMinutes() > 0) {
                json.put("durationMinutes", event.getDurationMinutes());
            }

            return json;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting event to JSON: " + e.getMessage());
        }
    }

    // Get all events
    public List<Event> getAllEvents() {
        return events;
    }

    // Find event by ID
    public Event findEventById(String id) {
        // Check ID
        if (id == null || id.trim().isEmpty()) {
            return null;
        }

        // Look for the event
        for (Event event : events) {
            if (event.getEventId().equals(id)) {
                return event;
            }
        }
        return null;
    }

    // Remove event
    public boolean removeEvent(String id) {
        // Check ID
        if (id == null || id.trim().isEmpty()) {
            return false;
        }

        Event eventToRemove = null;

        // Find the event
        for (Event event : events) {
            if (event.getEventId().equals(id)) {
                eventToRemove = event;
                break;
            }
        }

        // Remove it
        if (eventToRemove != null) {
            boolean removed = events.remove(eventToRemove);
            if (removed) {
                // Save changes
                saveEvents();
            }
            return removed;
        }

        return false;
    }

    // Add new event
    public void addEvent(Event event) {
        // Check event
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }

        // Validate event
        EventValidator.ValidationResult result = EventValidator.validateEvent(event);
        if (!result.isValid()) {
            throw new IllegalArgumentException("Invalid event: " + result.getErrorMessage());
        }

        events.add(event);
        saveEvents();
    }

    // Create event from JSON
    public Event createEventFromJson(JSONObject eventJson) {
        // Check JSON
        if (eventJson == null) {
            throw new IllegalArgumentException("Event JSON cannot be null");
        }

        Event newEvent = new Event();

        try {
            // Parse date
            String dateStr = eventJson.getString("date");
            newEvent.setDate(LocalDateTime.parse(dateStr, DATE_FORMATTER));
        } catch (DateTimeParseException e) {
            return null;
        }

        try {
            // Set required fields
            newEvent.setTitle(eventJson.getString("title"));
            newEvent.setEventType(eventJson.getString("eventType"));
            newEvent.setLocation(eventJson.getString("location"));
            newEvent.setCity(eventJson.getString("city"));
            newEvent.setTotalTickets(eventJson.getInt("totalTickets"));
            newEvent.setTicketPrice(eventJson.getDouble("ticketPrice"));
            newEvent.setAgeRating(eventJson.getInt("ageRating"));

            // Set optional fields
            if (eventJson.has("eventId")) {
                newEvent.setEventId(eventJson.getString("eventId"));
            } else {
                // Generate ID
                newEvent.setEventId(java.util.UUID.randomUUID().toString());
            }

            if (eventJson.has("venueAddress")) {
                newEvent.setVenueAddress(eventJson.getString("venueAddress"));
            }

            if (eventJson.has("postcode")) {
                newEvent.setPostcode(eventJson.getString("postcode"));
            }

            if (eventJson.has("description")) {
                newEvent.setDescription(eventJson.getString("description"));
            }

            if (eventJson.has("durationMinutes")) {
                newEvent.setDurationMinutes(eventJson.getInt("durationMinutes"));
            }

            if (eventJson.has("currency")) {
                newEvent.setCurrency(eventJson.getString("currency"));
            } else {
                newEvent.setCurrency("USD"); // Default
            }

            // Start with 0 booked tickets
            newEvent.setBookedTickets(0);

            return newEvent;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error creating event from JSON: " + e.getMessage());
        }
    }

    // Search for events
    public List<Event> searchEventsByCriteria(SearchCriteria criteria) {
        List<Event> results = new ArrayList<Event>();

        // Check events against criteria
        for (Event event : events) {
            if (matchesCriteria(event, criteria)) {
                results.add(event);
            }
        }

        // Sort results
        if (criteria.getSortBy() != null && !criteria.getSortBy().isEmpty()) {
            sortResults(results, criteria.getSortBy(), criteria.getSortOrder());
        }

        return results;
    }

    // Check if event matches criteria
    private boolean matchesCriteria(Event event, SearchCriteria criteria) {
        // Check title
        if (criteria.getTitle() != null && !criteria.getTitle().isEmpty()) {
            if (!event.getTitle().toLowerCase().contains(criteria.getTitle().toLowerCase())) {
                return false;
            }
        }

        // Check event type
        if (criteria.getEventType() != null && !criteria.getEventType().isEmpty()) {
            String eventType = event.getEventType().toLowerCase();
            String criteriaType = criteria.getEventType().toLowerCase();

            // Exact match for category filter
            if (!eventType.equals(criteriaType)) {
                return false;
            }
        }

        // Check dates
        if (criteria.getStartDate() != null) {
            if (event.getDate().isBefore(criteria.getStartDate())) {
                return false;
            }
        }

        if (criteria.getEndDate() != null) {
            if (event.getDate().isAfter(criteria.getEndDate())) {
                return false;
            }
        }

        // Check location
        if (criteria.getLocation() != null && !criteria.getLocation().isEmpty()) {
            boolean locationMatches = false;

            if (event.getLocation() != null
                    && event.getLocation().toLowerCase().contains(criteria.getLocation().toLowerCase())) {
                locationMatches = true;
            }

            if (event.getVenueAddress() != null
                    && event.getVenueAddress().toLowerCase().contains(criteria.getLocation().toLowerCase())) {
                locationMatches = true;
            }

            if (event.getPostcode() != null
                    && event.getPostcode().toLowerCase().contains(criteria.getLocation().toLowerCase())) {
                locationMatches = true;
            }

            if (!locationMatches) {
                return false;
            }
        }

        // Check city
        if (criteria.getCity() != null && !criteria.getCity().isEmpty()) {
            if (!event.getCity().toLowerCase().contains(criteria.getCity().toLowerCase())) {
                return false;
            }
        }

        // Check price
        if (criteria.getMinPrice() != null) {
            if (event.getTicketPrice() < criteria.getMinPrice()) {
                return false;
            }
        }

        if (criteria.getMaxPrice() != null) {
            if (event.getTicketPrice() > criteria.getMaxPrice()) {
                return false;
            }
        }

        // Check age rating
        if (criteria.getMinAgeRating() != null) {
            if (event.getAgeRating() < criteria.getMinAgeRating()) {
                return false;
            }
        }

        if (criteria.getMaxAgeRating() != null) {
            if (event.getAgeRating() > criteria.getMaxAgeRating()) {
                return false;
            }
        }

        // Check free tickets
        if (criteria.getHasFreeTickets() != null && criteria.getHasFreeTickets()) {
            if (event.getTicketPrice() > 0) {
                return false;
            }
        }

        // All checks passed
        return true;
    }

    // Sort results
    private void sortResults(List<Event> results, String sortBy, String sortOrder) {
        boolean ascending = true;

        // Check sort order
        if (sortOrder != null && sortOrder.equalsIgnoreCase("desc")) {
            ascending = false;
        }

        // Create comparator
        final Comparator<Event> comparator;

        if ("price".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return Double.compare(e1.getTicketPrice(), e2.getTicketPrice());
                }
            };
        } else if ("date".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return e1.getDate().compareTo(e2.getDate());
                }
            };
        } else if ("title".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return e1.getTitle().compareToIgnoreCase(e2.getTitle());
                }
            };
        } else if ("location".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return e1.getLocation().compareToIgnoreCase(e2.getLocation());
                }
            };
        } else if ("city".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return e1.getCity().compareToIgnoreCase(e2.getCity());
                }
            };
        } else if ("agerating".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return Integer.compare(e1.getAgeRating(), e2.getAgeRating());
                }
            };
        } else if ("remaining".equalsIgnoreCase(sortBy)) {
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return Integer.compare(e1.getRemainingTickets(), e2.getRemainingTickets());
                }
            };
        } else {
            // Default sort by date
            comparator = new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return e1.getDate().compareTo(e2.getDate());
                }
            };
        }

        // Sort
        if (ascending) {
            Collections.sort(results, comparator);
        } else {
            Collections.sort(results, new Comparator<Event>() {
                @Override
                public int compare(Event e1, Event e2) {
                    return comparator.compare(e2, e1); // Reverse order
                }
            });
        }
    }

    // Old search method for compatibility
    public List<Event> searchEvents(
            LocalDateTime searchDate,
            String address,
            String city,
            String eventType,
            Double minPrice,
            Double maxPrice) {

        // Convert to search criteria
        SearchCriteria criteria = new SearchCriteria();
        criteria.setStartDate(searchDate);
        criteria.setEndDate(searchDate);
        criteria.setLocation(address);
        criteria.setCity(city);
        criteria.setEventType(eventType);
        criteria.setMinPrice(minPrice);
        criteria.setMaxPrice(maxPrice);

        return searchEventsByCriteria(criteria);
    }
}