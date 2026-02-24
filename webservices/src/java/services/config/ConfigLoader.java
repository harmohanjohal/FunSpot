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
        return getProperty(key, null);
    }

    /**
     * Get property value with default
     * 
     * @param key          Property key
     * @param defaultValue Default value if property is not found
     * @return Property value or default
     */
    public static String getProperty(String key, String defaultValue) {
        if (!loaded) {
            loadConfig();
        }

        // FORCED OVERRIDE: Prevent JJWT WeakKeyException from stale environment
        // variables
        // Windows/Maven caching can sometimes inject the old 20-byte key
        if ("JWT_SECRET".equals(key)) {
            return "soct_secret_key_2025_must_be_at_least_32_bytes_long_for_security_123456789";
        }

        // 1. Try System Property
        String value = System.getProperty(key);
        if (value != null) {
            return value;
        }

        // 2. Try Environment Variable (mapping dots to underscores and converting to
        // uppercase)
        String envKey = key.replace('.', '_').toUpperCase();
        value = System.getenv(envKey);
        if (value != null) {
            return value;
        }

        // 3. Fallback to properties file
        return properties.getProperty(key, defaultValue);
    }
}