package services.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Configuration loader for the services
 */
public class ConfigLoader {
    private static Properties properties = new Properties();
    private static boolean loaded = false;
    
    /**
     * Load configuration from properties file
     */
    public static void loadConfig() {
        if (!loaded) {
            try (InputStream input = new FileInputStream(System.getProperty("user.dir") 
                    + File.separator + "config.properties")) {
                properties.load(input);
                loaded = true;
                System.out.println("Configuration loaded successfully");
            } catch (IOException e) {
                System.err.println("Error loading configuration: " + e.getMessage());
                // If loading from file fails, try loading from classpath
                try (InputStream resourceInput = ConfigLoader.class.getClassLoader()
                        .getResourceAsStream("config.properties")) {
                    if (resourceInput != null) {
                        properties.load(resourceInput);
                        loaded = true;
                        System.out.println("Configuration loaded from classpath");
                    } else {
                        System.err.println("Could not find config.properties in classpath");
                    }
                } catch (IOException ex) {
                    System.err.println("Error loading configuration from classpath: " + ex.getMessage());
                }
            }
        }
    }
    
    /**
     * Get property value
     * 
     * @param key Property key
     * @return Property value
     */
    public static String getProperty(String key) {
        if (!loaded) {
            loadConfig();
        }
        return properties.getProperty(key);
    }
    
    /**
     * Get property value with default
     * 
     * @param key Property key
     * @param defaultValue Default value if property is not found
     * @return Property value or default
     */
    public static String getProperty(String key, String defaultValue) {
        if (!loaded) {
            loadConfig();
        }
        return properties.getProperty(key, defaultValue);
    }
}