package services.currency;

import org.json.JSONObject;
import services.config.ConfigLoader;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class CurrencyService {

    // Default API key - must be provided in config.properties or environment
    // variable
    private static final String DEFAULT_API_KEY = "";
    private static final String DEFAULT_API_URL = "http://api.exchangeratesapi.io/v1/latest";

    private final String apiKey;
    private final String apiBaseUrl;

    public CurrencyService() {
        // Load configuration with fallback to defaults
        this.apiKey = ConfigLoader.getProperty("currency.api.key", DEFAULT_API_KEY);
        this.apiBaseUrl = ConfigLoader.getProperty("currency.api.url", DEFAULT_API_URL);

        // Log configuration (without sensitive data)
        System.out.println("CurrencyService initialized with API URL: " + apiBaseUrl);
    }

    public String convertCurrency(double amount, String fromCurrency, String toCurrency) {
        JSONObject response = new JSONObject();

        // Basic validation
        if (amount < 0) {
            response.put("success", false);
            response.put("error", "Amount cannot be negative");
            return response.toString();
        }

        if (fromCurrency == null || fromCurrency.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Source currency cannot be empty");
            return response.toString();
        }

        if (toCurrency == null || toCurrency.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Target currency cannot be empty");
            return response.toString();
        }

        try {
            String apiUrl = apiBaseUrl + "?access_key=" + apiKey;

            URL url = new URL(apiUrl);

            // Open connection
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));

                StringBuilder apiResponse = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    apiResponse.append(line);
                }
                reader.close();

                // Parse the JSON response
                JSONObject jsonResponse = new JSONObject(apiResponse.toString());

                // Check if the API call was successful
                if (jsonResponse.getBoolean("success")) {
                    // Get the exchange rates
                    JSONObject rates = jsonResponse.getJSONObject("rates");

                    // Calculate the converted amount
                    double convertedAmount;

                    if (fromCurrency.equals("EUR")) {
                        // EUR to target currency
                        double rate = rates.getDouble(toCurrency);
                        convertedAmount = amount * rate;
                    } else if (toCurrency.equals("EUR")) {
                        // Source currency to EUR
                        double rate = rates.getDouble(fromCurrency);
                        convertedAmount = amount / rate;
                    } else {
                        // Need to convert source -> EUR -> target
                        double rateFrom = rates.getDouble(fromCurrency);
                        double rateTo = rates.getDouble(toCurrency);

                        // Convert to EUR first, then to target currency
                        double amountInEUR = amount / rateFrom;
                        convertedAmount = amountInEUR * rateTo;
                    }

                    // Build success response
                    response.put("success", true);
                    response.put("amount", amount);
                    response.put("fromCurrency", fromCurrency);
                    response.put("toCurrency", toCurrency);
                    response.put("convertedAmount", convertedAmount);
                    response.put("rate", convertedAmount / amount);
                } else {
                    // Handle API error in JSON
                    String errorMsg = jsonResponse.has("error") ? jsonResponse.get("error").toString()
                            : "Unknown API error";
                    System.err.println("Currency API error: " + errorMsg);

                    response.put("success", false);
                    response.put("error", "Currency API returned failure: " + errorMsg);
                }
            } else {
                // Read error message from stream if available
                String errorBody = "";
                InputStream errorStream = connection.getErrorStream();
                if (errorStream != null) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(errorStream));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();
                    errorBody = sb.toString();
                }
                System.err.println("Currency API request failed. Code: " + responseCode + ", Body: " + errorBody);

                response.put("success", false);
                response.put("error", "API request failed with response code: " + responseCode);
            }
        } catch (Exception e) {
            // Simple exception handling - log and return error message
            System.err.println("Error converting currency: " + e.getMessage());

            response.put("success", false);
            response.put("error", "Error converting currency: " + e.getMessage());
        }

        return response.toString();
    }

    public String getAvailableCurrencies() {
        JSONObject response = new JSONObject();

        try {
            // Build API URL with key
            String apiUrl = apiBaseUrl + "?access_key=" + apiKey;

            // Create a URL object
            URL url = new URL(apiUrl);

            // Open connection
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // Get the response code
            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Read the response
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));

                StringBuilder apiResponse = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    apiResponse.append(line);
                }
                reader.close();

                // Parse the JSON response
                JSONObject jsonResponse = new JSONObject(apiResponse.toString());

                // Check if the API call was successful
                if (jsonResponse.getBoolean("success")) {
                    // Just return the list of currencies (keys from the rates object)
                    JSONObject rates = jsonResponse.getJSONObject("rates");

                    response.put("success", true);
                    response.put("currencies", rates.keySet());
                    response.put("baseCurrency", jsonResponse.getString("base"));
                } else {
                    // Handle API error
                    String errorCode = jsonResponse.has("error") ? jsonResponse.getJSONObject("error").getString("code")
                            : "unknown";

                    response.put("success", false);
                    response.put("error", "Currency API error: " + errorCode);
                }
            } else {
                response.put("success", false);
                response.put("error", "API request failed with response code: " + responseCode);
            }
        } catch (Exception e) {
            System.err.println("Error getting currencies: " + e.getMessage());

            response.put("success", false);
            response.put("error", "Error getting currencies: " + e.getMessage());
        }

        return response.toString();
    }
}