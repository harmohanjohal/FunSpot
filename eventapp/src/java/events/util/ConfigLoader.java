package events.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigLoader {
    private static Properties properties = new Properties();
    private static boolean loaded = false;
    
    public static void loadConfig() {
        if (!loaded) {
            try (InputStream input = new FileInputStream(System.getProperty("user.dir") 
                    + File.separator + "config.properties")) {
                properties.load(input);
                loaded = true;
                System.out.println("Configuration loaded successfully");
            } catch (IOException e) {
                System.err.println("Error loading configuration: " + e.getMessage());
            }
        }
    }
    
    public static String getProperty(String key) {
        if (!loaded) {
            loadConfig();
        }
        return properties.getProperty(key);
    }
}