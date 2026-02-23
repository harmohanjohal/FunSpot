package services.rest;

import services.directions.DirectionsService;
import services.util.ErrorUtils;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

/**
 * REST resource for directions services
 */
@Path("directions")
public class DirectionsResource {
    
    private final DirectionsService directionsService;
    
    /**
     * Constructor initializes the directions service
     */
    public DirectionsResource() {
        this.directionsService = new DirectionsService();
    }
    
    /**
     * Get directions endpoint - basic version with full addresses
     * 
     * @param from Starting address
     * @param to Destination address
     * @param mode Transportation mode
     * @return JSON response with directions
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getDirections(
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @QueryParam("mode") String mode) {
        
        // Validate parameters
        if (from == null || from.trim().isEmpty()) {
            return ErrorUtils.createErrorResponse("Starting address is required");
        }
        
        if (to == null || to.trim().isEmpty()) {
            return ErrorUtils.createErrorResponse("Destination address is required");
        }
        
        try {
            if (mode != null && !mode.trim().isEmpty()) {
                return directionsService.getDirections(to, from, mode);
            } else {
                return directionsService.getDirections(to, from);
            }
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error getting directions", e);
        }
    }
    
    /**
     * Get directions to venue endpoint - for compatibility with original app
     * Constructs destination address from components
     * 
     * @param venueName Venue name or location
     * @param venueAddress Street address (optional)
     * @param city City name
     * @param postcode Postal code
     * @param from Starting address
     * @param mode Transportation mode
     * @return JSON response with directions
     */
    @GET
    @Path("venue")
    @Produces(MediaType.APPLICATION_JSON)
    public String getDirectionsToVenue(
            @QueryParam("venueName") String venueName,
            @QueryParam("venueAddress") String venueAddress,
            @QueryParam("city") String city,
            @QueryParam("postcode") String postcode,
            @QueryParam("from") String from,
            @QueryParam("mode") String mode) {
        
        // Validate parameters
        if (from == null || from.trim().isEmpty()) {
            return ErrorUtils.createErrorResponse("Starting address is required");
        }
        
        if ((venueName == null || venueName.trim().isEmpty()) &&
            (venueAddress == null || venueAddress.trim().isEmpty())) {
            return ErrorUtils.createErrorResponse("Venue name or address is required");
        }
        
        try {
            return directionsService.getDirectionsToVenue(
                venueName, venueAddress, city, postcode, from, mode);
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error getting directions to venue", e);
        }
    }
}