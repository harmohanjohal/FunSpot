package events.service;

import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

public class CityInfoService {

    //External Wikipedia API being used for fact generation about host city
    private static final String WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

    public String getCityFacts(String cityName) {
        JSONObject response = new JSONObject();

        if (cityName == null || cityName.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "City name cannot be empty");
            return response.toString();
        }

        try {
            String encodedCityName = URLEncoder.encode(cityName, "UTF-8");

            // Build the Wikipedia API URL with parameters
            String apiUrl = WIKIPEDIA_API_URL
                    + "?action=query"
                    + "&format=json"
                    + "&prop=extracts"
                    + "&exintro=1"
                    + "&explaintext=1"
                    + "&redirects=1"
                    + "&titles=" + encodedCityName;

            //Making connection with Wikipedia
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "EventAppCityInfoService/1.0");

            //Checking if connetion worked
            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {

                // Reading Wikipedia's response
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream()));

                StringBuilder apiResponse = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    apiResponse.append(line);
                }
                reader.close();

                JSONObject jsonResponse = new JSONObject(apiResponse.toString());

                // Extract city text from Wikipedia
                List<String> facts = extractFacts(jsonResponse);

                if (facts.isEmpty()) {
                    response.put("success", false);
                    response.put("error", "No information found for " + cityName);
                } else {
                    response.put("success", true);
                    response.put("cityName", cityName);
                    response.put("facts", new JSONArray(facts));
                }
            } else {
                response.put("success", false);
                response.put("error", "Wikipedia API request failed with response code: " + responseCode);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Error fetching city information: " + e.getMessage());
            e.printStackTrace();
        }

        return response.toString();
    }

    // Helper method to extract facts from the Wikipedia response
    private List<String> extractFacts(JSONObject jsonResponse) {
        List<String> facts = new ArrayList<>();

        try {
            JSONObject query = jsonResponse.getJSONObject("query");
            JSONObject pages = query.getJSONObject("pages");

            // Get the first page ID (we don't know it in advance)
            String firstPageId = pages.keys().next();

            if ("-1".equals(firstPageId)) {
                return facts;
            }

            JSONObject page = pages.getJSONObject(firstPageId);

            String extract = page.getString("extract");

            String[] sentences = extract.split("\\. ");

            for (int i = 0; i < Math.min(5, sentences.length); i++) {
                String sentence = sentences[i].trim();
                if (!sentence.isEmpty() && sentence.length() <= 100) {
                    facts.add(sentence + ".");
                }

                if (facts.size() >= 5) {
                    break;
                }
            }

            if (facts.size() < 5) {
                for (int i = 0; i < sentences.length && facts.size() < 5; i++) {
                    String sentence = sentences[i].trim();
                    if (!sentence.isEmpty() && !facts.contains(sentence + ".") && sentence.length() <= 150) {
                        facts.add(sentence + ".");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return facts;
    }
}
