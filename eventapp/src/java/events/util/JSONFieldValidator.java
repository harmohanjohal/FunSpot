package events.util;

import org.json.JSONObject;

public class JSONFieldValidator {
    
    public static boolean validateRequiredFields(JSONObject json, String[] requiredFields) {
        if (json == null || requiredFields == null) {
            return false;
        }
        
        for (String field : requiredFields) {
            if (!json.has(field)) {
                return false;
            }
        }
        
        return true;
    }
    
    public static String getMissingFieldsMessage(JSONObject json, String[] requiredFields) {
        if (json == null || requiredFields == null) {
            return "Invalid JSON or required fields list";
        }
        
        StringBuilder missingFields = new StringBuilder();
        
        for (String field : requiredFields) {
            if (!json.has(field)) {
                if (missingFields.length() > 0) {
                    missingFields.append(", ");
                }
                missingFields.append(field);
            }
        }
        
        if (missingFields.length() > 0) {
            return "Missing required fields: " + missingFields.toString();
        }
        
        return null;
    }
}