package service;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import org.json.JSONArray;
import org.json.JSONObject;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Path("images")
public class ImageService {

    // Load API key from environment variable or config
    // Load API key from environment variable
    private static final String PIXABAY_API_KEY = System.getenv("PIXABAY_API_KEY");
    private static final String PIXABAY_API_URL = "https://pixabay.com/api/";

    @GET
    @Path("event")
    @Produces(MediaType.APPLICATION_JSON)
    public String getEventImage(@QueryParam("type") String searchTerm) {
        JSONObject response = new JSONObject();

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Search term is required");
            return response.toString();
        }

        try {
            // URL encode the search term
            String encodedSearchTerm = URLEncoder.encode(searchTerm.toLowerCase(), "UTF-8");

            // Construct the Pixabay API URL with more specific parameters for better
            // results
            String apiUrl = PIXABAY_API_URL
                    + "?key=" + PIXABAY_API_KEY
                    + "&q=" + encodedSearchTerm
                    + "&image_type=photo"
                    + "&per_page=5"
                    + // Fetch more images to have better options
                    "&safesearch=true"
                    + "&orientation=horizontal"
                    + "&min_width=300"
                    + "&min_height=200"
                    + "&order=popular"; // Order by popularity for better results

            // Create URL and open connection
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            // Check response code
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                response.put("success", false);
                response.put("error", "Failed to fetch image. Response code: " + responseCode);
                return response.toString();
            }

            // Read the response
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));

            StringBuilder apiResponse = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                apiResponse.append(line);
            }
            reader.close();

            // Parse JSON response
            JSONObject pixabayResponse = new JSONObject(apiResponse.toString());
            JSONArray hits = pixabayResponse.getJSONArray("hits");

            if (hits.length() > 0) {
                // Get the first image URL (most relevant based on popularity)
                String imageUrl = hits.getJSONObject(0).getString("webformatURL");

                // Create success response
                response.put("success", true);
                response.put("imageUrl", imageUrl);
                response.put("searchTerm", searchTerm);

                // Include total hits for debugging/monitoring
                response.put("totalHits", pixabayResponse.getInt("totalHits"));
            } else {
                // No images found
                response.put("success", false);
                response.put("error", "No images found for: " + searchTerm);
                response.put("totalHits", 0);
            }

        } catch (Exception e) {
            // Handle errors
            response.put("success", false);
            response.put("error", "Error fetching image: " + e.getMessage());
        }

        return response.toString();
    }

    @GET
    @Path("qrcode")
    @Produces(MediaType.APPLICATION_JSON)
    public String generateQRCode(
            @QueryParam("ref") String bookingReference,
            @QueryParam("event") String eventName,
            @QueryParam("date") String eventDate,
            @QueryParam("tickets") Integer numTickets,
            @QueryParam("user") String username) throws IOException {

        JSONObject response = new JSONObject();

        // Basic validation
        if (bookingReference == null || bookingReference.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Booking reference is required");
            return response.toString();
        }

        try {
            // Create a simple string format for the QR code content
            StringBuilder qrContent = new StringBuilder();
            qrContent.append("REF:").append(bookingReference);

            if (eventName != null && !eventName.trim().isEmpty()) {
                qrContent.append("|EVENT:").append(eventName);
            }

            if (eventDate != null && !eventDate.trim().isEmpty()) {
                qrContent.append("|DATE:").append(eventDate);
            }

            if (numTickets != null && numTickets > 0) {
                qrContent.append("|TICKETS:").append(numTickets);
            }

            if (username != null && !username.trim().isEmpty()) {
                qrContent.append("|USER:").append(username);
            }

            // used to encode the string into a QR code format
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            // results in a BitMatrix representing the QR code
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent.toString(), BarcodeFormat.QR_CODE, 250, 250);

            // Convert to image
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            // BitMatrix is converted into a PNG image using MatrixToImageWriter
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            // Convert to Base64
            String base64Image = Base64.getEncoder().encodeToString(outputStream.toByteArray());

            // Build success response
            response.put("success", true);
            response.put("qrCode", base64Image);

        } catch (WriterException | IOException e) {
            // Handle errors
            response.put("success", false);
            response.put("error", "Error generating QR code: " + e.getMessage());
            System.err.println("Error generating QR code: " + e.getMessage());
        }

        return response.toString();
    }
}
