package events.model;

import java.time.LocalDateTime;

public class SearchCriteria {

    // Search filters
    private String title;
    private String eventType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private String city;
    private Double minPrice;
    private Double maxPrice;
    private Integer minAgeRating;
    private Integer maxAgeRating;
    private Boolean hasFreeTickets;

    // Sorting options
    private String sortBy;
    private String sortOrder;

    // Empty constructor
    public SearchCriteria() {

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

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    public Integer getMinAgeRating() {
        return minAgeRating;
    }

    public void setMinAgeRating(Integer minAgeRating) {
        this.minAgeRating = minAgeRating;
    }

    public Integer getMaxAgeRating() {
        return maxAgeRating;
    }

    public void setMaxAgeRating(Integer maxAgeRating) {
        this.maxAgeRating = maxAgeRating;
    }

    public Boolean getHasFreeTickets() {
        return hasFreeTickets;
    }

    public void setHasFreeTickets(Boolean hasFreeTickets) {
        this.hasFreeTickets = hasFreeTickets;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }

    // Makes the search criteria readable when printing
    @Override
    public String toString() {
        return "SearchCriteria [title=" + title + ", eventType=" + eventType + ", startDate=" + startDate + ", endDate="
                + endDate + ", location=" + location + ", city=" + city + ", minPrice=" + minPrice + ", maxPrice="
                + maxPrice + ", minAgeRating=" + minAgeRating + ", maxAgeRating=" + maxAgeRating + ", hasFreeTickets="
                + hasFreeTickets + ", sortBy=" + sortBy + ", sortOrder=" + sortOrder + "]";
    }
}
