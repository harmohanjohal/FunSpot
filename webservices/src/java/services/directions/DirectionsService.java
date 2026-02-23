package services.directions;

import org.json.JSONArray;
import org.json.JSONObject;
import services.config.ConfigLoader;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

public class DirectionsService {

    // Default API key and URL - can be overridden in config.properties
   private static final String DEFAULT_API_URL = "https://maps.googleapis.com/maps/api/directions/json";
   private static final String DEFAULT_API_KEY = "";
    
    private final String apiKey;
    private final String apiBaseUrl;
    
    public DirectionsService() {
        // Load configuration with fallback to defaults
        this.apiKey = ConfigLoader.getProperty("directions.api.key", DEFAULT_API_KEY);
        this.apiBaseUrl = ConfigLoader.getProperty("directions.api.url", DEFAULT_API_URL);
        
        // Log configuration (without sensitive data)
        System.out.println("DirectionsService initialized with API URL: " + apiBaseUrl);
    }
    
    public String getDirections(String to, String from, String mode) {
        JSONObject response = new JSONObject();

        // Basic validation
        if (to == null || to.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Destination address cannot be empty");
            return response.toString();
        }
        
        if (from == null || from.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Starting address cannot be empty");
            return response.toString();
        }
        
        // Validate transportation mode
        String transportMode = mode != null ? mode.toLowerCase() : "driving";
        if (!isValidTransportMode(transportMode)) {
            transportMode = "driving"; // Default to driving if invalid
        }

        try {
            // Encode addresses for URL
            String encodedFrom = URLEncoder.encode(from, "UTF-8");
            String encodedTo = URLEncoder.encode(to, "UTF-8");

            // Build API URL
            String apiUrl = apiBaseUrl
                    + "?origin=" + encodedFrom
                    + "&destination=" + encodedTo
                    + "&mode=" + transportMode
                    + "&key=" + apiKey;

            // Create URL object and open connection
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // Get response code
            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Read the response
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream())
                );

                StringBuilder apiResponse = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    apiResponse.append(line);
                }
                reader.close();

                // Parse the JSON response
                JSONObject directionsData = new JSONObject(apiResponse.toString());

                // Check if the API call was successful
                String status = directionsData.getString("status");
                if ("OK".equals(status)) {
                    // Extract relevant information
                    JSONArray routes = directionsData.getJSONArray("routes");

                    if (routes.length() > 0) {
                        JSONObject route = routes.getJSONObject(0);
                        JSONArray legs = route.getJSONArray("legs");
                        JSONObject leg = legs.getJSONObject(0);

                        // Get distance and duration
                        JSONObject distance = leg.getJSONObject("distance");
                        JSONObject duration = leg.getJSONObject("duration");

                        // Get step-by-step directions
                        JSONArray steps = leg.getJSONArray("steps");
                        JSONArray directions = new JSONArray();

                        for (int i = 0; i < steps.length(); i++) {
                            JSONObject step = steps.getJSONObject(i);
                            String instruction = step.getString("html_instructions")
                                    .replaceAll("<[^>]*>", ""); // Remove HTML tags

                            JSONObject directionStep = new JSONObject();
                            directionStep.put("instruction", instruction);

                            if (step.has("distance")) {
                                directionStep.put("distance", step.getJSONObject("distance").getString("text"));
                            }

                            directions.put(directionStep);
                        }

                        // Build successful response
                        response.put("success", true);
                        response.put("fromAddress", from);
                        response.put("toAddress", to);
                        response.put("transportMode", transportMode);
                        response.put("distance", distance.getString("text"));
                        response.put("duration", duration.getString("text"));
                        response.put("directions", directions);
                    } else {
                        response.put("success", false);
                        response.put("error", "No routes found");
                    }
                } else {
                    response.put("success", false);
                    response.put("error", "Google Directions API returned error: " + status);
                }
            } else {
                response.put("success", false);
                response.put("error", "API request failed with response code: " + responseCode);
            }
        } catch (Exception e) {
            // Simple exception handling - log and return error message
            System.err.println("Error getting directions: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", "Error getting directions: " + e.getMessage());
        }

        return response.toString();
    }
    
    private boolean isValidTransportMode(String mode) {
        return "driving".equals(mode) || 
               "walking".equals(mode) || 
               "bicycling".equals(mode) || 
               "transit".equals(mode);
    }
    
    public String getDirections(String to, String from) {
        return getDirections(to, from, "driving");
    }
    
    public String getDirectionsToVenue(String venueName, String venueAddress, 
                                      String city, String postcode, 
                                      String from, String mode) {
        // Build the destination address from components
        StringBuilder destinationBuilder = new StringBuilder();
        
        // Add venue address if available
        if (venueAddress != null && !venueAddress.trim().isEmpty()) {
            destinationBuilder.append(venueAddress);
        } else if (venueName != null && !venueName.trim().isEmpty()) {
            // Use venue name/location if address is not available
            destinationBuilder.append(venueName);
        }
        
        // Add city
        if (city != null && !city.trim().isEmpty()) {
            if (destinationBuilder.length() > 0) {
                destinationBuilder.append(", ");
            }
            destinationBuilder.append(city);
        }
        
        // Add postcode
        if (postcode != null && !postcode.trim().isEmpty()) {
            if (destinationBuilder.length() > 0) {
                destinationBuilder.append(", ");
            }
            destinationBuilder.append(postcode);
        }
        
        String destinationAddress = destinationBuilder.toString();
        
        // Check if we have a valid destination
        if (destinationAddress.trim().isEmpty()) {
            JSONObject response = new JSONObject();
            response.put("success", false);
            response.put("error", "Cannot determine destination address from provided information");
            return response.toString();
        }
        
        // Get directions using the combined address
        return getDirections(destinationAddress, from, mode);
    }
}