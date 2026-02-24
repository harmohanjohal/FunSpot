package config;

import java.util.HashSet;
import java.util.Set;
import javax.ws.rs.ApplicationPath;

@ApplicationPath("api")
public class ApplicationConfig extends javax.ws.rs.core.Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new HashSet<>();
        addRestResourceClasses(resources);
        return resources;
    }

    private void addRestResourceClasses(Set<Class<?>> resources) {
        resources.add(service.ImageService.class);
        resources.add(util.CORSFilter.class);
        resources.add(util.SecurityFilter.class);
    }
}