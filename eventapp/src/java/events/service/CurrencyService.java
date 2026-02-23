//package events.service;
//
//import org.json.JSONObject;
//import events.util.ConfigLoader;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//import java.net.HttpURLConnection;
//import java.net.URL;
//
///**
// * Service for handling currency conversion operations
// * With simple error handling
// */
//public class CurrencyService {
//
//    private static final String API_KEY = "da8f8725a9a3fd222de9a9c04b9b038c";
//    private static final String API_BASE_URL = "http://api.exchangeratesapi.io/v1/latest";
//
//    /**
//     * Convert an amount from one currency to another
//     *
//     * @param amount the amount to convert
//     * @param fromCurrency the source currency code
//     * @param toCurrency the target currency code
//     * @return JSON string with conversion result
//     */
//    public String convertCurrency(double amount, String fromCurrency, String toCurrency) {
//        JSONObject response = new JSONObject();
//        
//        // Basic validation
//        if (amount < 0) {
//            response.put("success", false);
//            response.put("error", "Amount cannot be negative");
//            return response.toString();
//        }
//        
//        if (fromCurrency == null || fromCurrency.trim().isEmpty()) {
//            response.put("success", false);
//            response.put("error", "Source currency cannot be empty");
//            return response.toString();
//        }
//        
//        if (toCurrency == null || toCurrency.trim().isEmpty()) {
//            response.put("success", false);
//            response.put("error", "Target currency cannot be empty");
//            return response.toString();
//        }
//
//        try {
//            // Build API URL with key
//            String apiUrl = API_BASE_URL + "?access_key=" + API_KEY;
//
//            // Create a URL object
//            URL url = new URL(apiUrl);
//
//            // Open connection
//            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
//            connection.setRequestMethod("GET");
//
//            // Get the response code
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
//                JSONObject jsonResponse = new JSONObject(apiResponse.toString());
//
//                // Check if the API call was successful
//                if (jsonResponse.getBoolean("success")) {
//                    // Get the exchange rates
//                    JSONObject rates = jsonResponse.getJSONObject("rates");
//
//                    // Calculate the converted amount
//                    double convertedAmount;
//                    
//                    // Note: In the free plan, EUR is the fixed base currency
//                    // So we need to convert relative to EUR
//                    if (fromCurrency.equals("EUR")) {
//                        // EUR to target currency
//                        double rate = rates.getDouble(toCurrency);
//                        convertedAmount = amount * rate;
//                    } else if (toCurrency.equals("EUR")) {
//                        // Source currency to EUR
//                        double rate = rates.getDouble(fromCurrency);
//                        convertedAmount = amount / rate;
//                    } else {
//                        // Need to convert source -> EUR -> target
//                        double rateFrom = rates.getDouble(fromCurrency);
//                        double rateTo = rates.getDouble(toCurrency);
//
//                        // Convert to EUR first, then to target currency
//                        double amountInEUR = amount / rateFrom;
//                        convertedAmount = amountInEUR * rateTo;
//                    }
//
//                    // Build success response
//                    response.put("success", true);
//                    response.put("amount", amount);
//                    response.put("fromCurrency", fromCurrency);
//                    response.put("toCurrency", toCurrency);
//                    response.put("convertedAmount", convertedAmount);
//                    response.put("rate", convertedAmount / amount);
//                } else {
//                    // Handle API error
//                    String errorCode = jsonResponse.has("error") ? 
//                                      jsonResponse.getJSONObject("error").getString("code") : 
//                                      "unknown";
//                    
//                    response.put("success", false);
//                    response.put("error", "Currency API error: " + errorCode);
//                }
//            } else {
//                response.put("success", false);
//                response.put("error", "API request failed with response code: " + responseCode);
//            }
//        } catch (Exception e) {
//            // Simple exception handling - log and return error message
//            System.err.println("Error converting currency: " + e.getMessage());
//            e.printStackTrace();
//            
//            response.put("success", false);
//            response.put("error", "Error converting currency: " + e.getMessage());
//        }
//
//        return response.toString();
//    }
//    
//    /**
//     * Get all available currencies
//     * 
//     * @return JSON string with list of available currencies
//     */
//    public String getAvailableCurrencies() {
//        JSONObject response = new JSONObject();
//
//        try {
//            // Build API URL with key
//            String apiUrl = API_BASE_URL + "?access_key=" + API_KEY;
//
//            // Create a URL object
//            URL url = new URL(apiUrl);
//
//            // Open connection
//            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
//            connection.setRequestMethod("GET");
//
//            // Get the response code
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
//                JSONObject jsonResponse = new JSONObject(apiResponse.toString());
//
//                // Check if the API call was successful
//                if (jsonResponse.getBoolean("success")) {
//                    // Just return the list of currencies (keys from the rates object)
//                    JSONObject rates = jsonResponse.getJSONObject("rates");
//                    
//                    response.put("success", true);
//                    response.put("currencies", rates.keySet());
//                    response.put("baseCurrency", jsonResponse.getString("base"));
//                } else {
//                    // Handle API error
//                    String errorCode = jsonResponse.has("error") ? 
//                                     jsonResponse.getJSONObject("error").getString("code") : 
//                                     "unknown";
//                    
//                    response.put("success", false);
//                    response.put("error", "Currency API error: " + errorCode);
//                }
//            } else {
//                response.put("success", false);
//                response.put("error", "API request failed with response code: " + responseCode);
//            }
//        } catch (Exception e) {
//            // Simple exception handling - log and return error message
//            System.err.println("Error getting currencies: " + e.getMessage());
//            e.printStackTrace();
//            
//            response.put("success", false);
//            response.put("error", "Error getting currencies: " + e.getMessage());
//        }
//
//        return response.toString();
//    }
//}