// This class represents an event with all its details 
package events.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Event {

    // Basic event details
    private String eventId;
    private String title;
    private String eventType;
    private LocalDateTime date;
    private String location;
    private String venueAddress;
    private String city;
    private String postcode; 
    
    // Ticket information
    private int totalTickets;
    private int bookedTickets;
    private double ticketPrice;
    private String currency;

    // Additional event info
    private int ageRating;
    private String description;
    private int durationMinutes;

    // Default constructor - creates new event with random ID
    public Event() {
        this.eventId = UUID.randomUUID().toString();
        this.bookedTickets = 0;
    }

    // Constructor with main parameters
    public Event(String title, String eventType, LocalDateTime date, String location,
            String city, int totalTickets, double ticketPrice, int ageRating) {
        this.eventId = UUID.randomUUID().toString();
        this.title = title;
        this.eventType = eventType;
        this.date = date;
        this.location = location;
        this.city = city;
        this.totalTickets = totalTickets;
        this.ticketPrice = ticketPrice;
        this.ageRating = ageRating;
        this.bookedTickets = 0;
        this.currency = "USD";
    }

    public int getRemainingTickets() {
        return totalTickets - bookedTickets;
    }

    public boolean bookTickets(int numTickets) {
        if (numTickets <= 0) {
            return false;  
        }

        if (numTickets <= getRemainingTickets()) {
            bookedTickets += numTickets;
            return true;
        }

        return false;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getVenueAddress() {
        return venueAddress;
    }

    public void setVenueAddress(String venueAddress) {
        this.venueAddress = venueAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
    
    public String getPostcode() {
        return postcode;
    }

    public void setPostcode(String postcode) {
        this.postcode = postcode;
    }

    public int getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(int totalTickets) {
        this.totalTickets = totalTickets;
    }

    public int getBookedTickets() {
        return bookedTickets;
    }

    public void setBookedTickets(int bookedTickets) {
        this.bookedTickets = bookedTickets;
    }

    public double getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(double ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public int getAgeRating() {
        return ageRating;
    }

    public void setAgeRating(int ageRating) {
        this.ageRating = ageRating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    // Makes the event readable when printing
    @Override
    public String toString() {
        return "Event{"
                + "eventId='" + eventId + '\''
                + ", title='" + title + '\''
                + ", eventType='" + eventType + '\''
                + ", date=" + date
                + ", location='" + location + '\''
                + ", city='" + city + '\''
                + ", postcode='" + postcode + '\''
                + ", totalTickets=" + totalTickets
                + ", bookedTickets=" + bookedTickets
                + ", ticketPrice=" + ticketPrice
                + ", currency='" + currency + '\''
                + ", ageRating=" + ageRating
                + '}';
    }
}