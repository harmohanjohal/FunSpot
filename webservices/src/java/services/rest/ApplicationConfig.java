package services.rest;

import java.util.Set;
import javax.ws.rs.core.Application;

/**
 * JAX-RS application configuration
 */
@javax.ws.rs.ApplicationPath("api")
public class ApplicationConfig extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new java.util.HashSet<>();
        addRestResourceClasses(resources);
        return resources;
    }

    /**
     * Add REST resource classes to the set
     */
    private void addRestResourceClasses(Set<Class<?>> resources) {
        resources.add(services.rest.CurrencyResource.class);
        resources.add(services.rest.DirectionsResource.class);
        resources.add(services.util.CORSFilter.class);
        resources.add(services.util.SecurityFilter.class);
    }
}