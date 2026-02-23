package services.rest;

import services.currency.CurrencyService;
import services.util.ErrorUtils;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

/**
 * REST resource for currency conversion operations
 */
@Path("currency")
public class CurrencyResource {
    
    private final CurrencyService currencyService;
    
    /**
     * Constructor initializes the currency service
     */
    public CurrencyResource() {
        this.currencyService = new CurrencyService();
    }
    
    /**
     * Convert currency endpoint
     * 
     * @param amount Amount to convert
     * @param fromCurrency Source currency code
     * @param toCurrency Target currency code
     * @return JSON response with conversion result
     */
    @GET
    @Path("convert")
    @Produces(MediaType.APPLICATION_JSON)
    public String convertCurrency(
            @QueryParam("amount") Double amount,
            @QueryParam("from") String fromCurrency,
            @QueryParam("to") String toCurrency) {
        
        // Validate parameters
        if (amount == null) {
            return ErrorUtils.createErrorResponse("Amount is required");
        }
        
        if (fromCurrency == null || fromCurrency.trim().isEmpty()) {
            return ErrorUtils.createErrorResponse("Source currency is required");
        }
        
        if (toCurrency == null || toCurrency.trim().isEmpty()) {
            return ErrorUtils.createErrorResponse("Target currency is required");
        }
        
        try {
            return currencyService.convertCurrency(amount, fromCurrency, toCurrency);
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error converting currency", e);
        }
    }
    
    /**
     * Get available currencies endpoint
     * 
     * @return JSON response with list of available currencies
     */
    @GET
    @Path("available")
    @Produces(MediaType.APPLICATION_JSON)
    public String getAvailableCurrencies() {
        try {
            return currencyService.getAvailableCurrencies();
        } catch (Exception e) {
            return ErrorUtils.createErrorResponse("Error getting available currencies", e);
        }
    }
}