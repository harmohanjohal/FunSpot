//package events.service;
//
//import org.json.JSONArray;
//import org.json.JSONObject;
//import events.model.Event;
//import events.util.ConfigLoader;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//import java.net.HttpURLConnection;
//import java.net.URL;
//import java.net.URLEncoder;
//
///**
// * Service for handling directions and mapping operations
// * With simple error handling
// */
//public class DirectionsService {
//
//    private static final String API_BASE_URL = "https://maps.googleapis.com/maps/api/directions/json";
//    private static final String API_KEY = "AIzaSyAdAZ_UNOF3iTBw8TeXSWLlGvpGjEtJCGA";
//
//    /**
//     * Get directions from a starting point to an event venue
//     *
//     * @param event the event to get directions to
//     * @param fromAddress the starting address
//     * @param mode the transportation mode (driving, walking, transit, bicycling)
//     * @return JSON response with directions data
//     */
//    public String getDirections(Event event, String fromAddress, String mode) {
//        JSONObject response = new JSONObject();
//
//        // Basic validation
//        if (event == null) {
//            response.put("success", false);
//            response.put("error", "Event cannot be null");
//            return response.toString();
//        }
//        
//        if (fromAddress == null || fromAddress.trim().isEmpty()) {
//            response.put("success", false);
//            response.put("error", "Starting address cannot be empty");
//            return response.toString();
//        }
//        
//        // Check for valid venue address
//        String destinationAddress = "";
//        if (event.getVenueAddress() != null && !event.getVenueAddress().trim().isEmpty()) {
//            destinationAddress = event.getVenueAddress();
//        } else {
//            // Use location + city + postcode if venue address is not available
//            StringBuilder addressBuilder = new StringBuilder();
//            addressBuilder.append(event.getLocation());
//            
//            if (event.getCity() != null && !event.getCity().trim().isEmpty()) {
//                addressBuilder.append(", ").append(event.getCity());
//            }
//            
//            if (event.getPostcode() != null && !event.getPostcode().trim().isEmpty()) {
//                addressBuilder.append(", ").append(event.getPostcode());
//            }
//            
//            destinationAddress = addressBuilder.toString();
//        }
//        
//        if (destinationAddress.trim().isEmpty()) {
//            response.put("success", false);
//            response.put("error", "Event venue address is not available");
//            return response.toString();
//        }
//        
//        // Validate transportation mode
//        String transportMode = mode != null ? mode.toLowerCase() : "driving";
//        if (!isValidTransportMode(transportMode)) {
//            transportMode = "driving"; // Default to driving if invalid
//        }
//
//        try {
//            // Encode addresses for URL
//            String encodedFrom = URLEncoder.encode(fromAddress, "UTF-8");
//            String encodedTo = URLEncoder.encode(destinationAddress, "UTF-8");
//
//            // Build API URL
//            String apiUrl = API_BASE_URL
//                    + "?origin=" + encodedFrom
//                    + "&destination=" + encodedTo
//                    + "&mode=" + transportMode
//                    + "&key=" + API_KEY;
//
//            // Create URL object and open connection
//            URL url = new URL(apiUrl);
//            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
//            connection.setRequestMethod("GET");
//
//            // Get response code
//            int responseCode = connection.getResponseCode();
//
//            if (responseCode == HttpURLConnection.HTTP_OK) {
//                // Read the response
//                BufferedReader reader = new BufferedReader(
//                        new InputStreamReader(connection.getInputStream())
//                );
//
//                StringBuilder apiResponse = new StringBuilder();
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    apiResponse.append(line);
//                }
//                reader.close();
//
//                // Parse the JSON response
//                JSONObject directionsData = new JSONObject(apiResponse.toString());
//
//                // Check if the API call was successful
//                String status = directionsData.getString("status");
//                if ("OK".equals(status)) {
//                    // Extract relevant information
//                    JSONArray routes = directionsData.getJSONArray("routes");
//
//                    if (routes.length() > 0) {
//                        JSONObject route = routes.getJSONObject(0);
//                        JSONArray legs = route.getJSONArray("legs");
//                        JSONObject leg = legs.getJSONObject(0);
//
//                        // Get distance and duration
//                        JSONObject distance = leg.getJSONObject("distance");
//                        JSONObject duration = leg.getJSONObject("duration");
//
//                        // Get step-by-step directions
//                        JSONArray steps = leg.getJSONArray("steps");
//                        JSONArray directions = new JSONArray();
//
//                        for (int i = 0; i < steps.length(); i++) {
//                            JSONObject step = steps.getJSONObject(i);
//                            String instruction = step.getString("html_instructions")
//                                    .replaceAll("<[^>]*>", ""); // Remove HTML tags
//
//                            JSONObject directionStep = new JSONObject();
//                            directionStep.put("instruction", instruction);
//
//                            if (step.has("distance")) {
//                                directionStep.put("distance", step.getJSONObject("distance").getString("text"));
//                            }
//
//                            directions.put(directionStep);
//                        }
//
//                        // Build successful response
//                        response.put("success", true);
//                        response.put("eventTitle", event.getTitle());
//                        response.put("fromAddress", fromAddress);
//                        response.put("toAddress", destinationAddress);
//                        response.put("transportMode", transportMode);
//                        response.put("distance", distance.getString("text"));
//                        response.put("duration", duration.getString("text"));
//                        response.put("directions", directions);
//                    } else {
//                        response.put("success", false);
//                        response.put("error", "No routes found");
//                    }
//                } else {
//                    response.put("success", false);
//                    response.put("error", "Google Directions API returned error: " + status);
//                }
//            } else {
//                response.put("success", false);
//                response.put("error", "API request failed with response code: " + responseCode);
//            }
//        } catch (Exception e) {
//            // Simple exception handling - log and return error message
//            System.err.println("Error getting directions: " + e.getMessage());
//            e.printStackTrace();
//            
//            response.put("success", false);
//            response.put("error", "Error getting directions: " + e.getMessage());
//        }
//
//        return response.toString();
//    }
//    
//    /**
//     * Check if the transportation mode is valid
//     * @param mode Transportation mode
//     * @return true if valid
//     */
//    private boolean isValidTransportMode(String mode) {
//        return "driving".equals(mode) || 
//               "walking".equals(mode) || 
//               "bicycling".equals(mode) || 
//               "transit".equals(mode);
//    }
//    
//    /**
//     * Get directions from a starting point to an event venue (original method)
//     *
//     * @param event the event to get directions to
//     * @param fromAddress the starting address
//     * @return JSON response with directions data
//     */
//    public String getDirections(Event event, String fromAddress) {
//        return getDirections(event, fromAddress, "driving");
//    }
//}