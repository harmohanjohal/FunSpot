package events.service;

import java.util.Set;
import javax.ws.rs.core.Application;

@javax.ws.rs.ApplicationPath("api")
public class ApplicationConfig extends Application {

    // Tell the system which classes are part of our API
    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new java.util.HashSet<>();
        addRestResourceClasses(resources);
        return resources;
    }

    // Add all REST services to the resources list
    private void addRestResourceClasses(Set<Class<?>> resources) {
        resources.add(events.service.EventService.class);
        resources.add(events.util.CORSFilter.class);
        resources.add(events.util.SecurityFilter.class);
    }
}
