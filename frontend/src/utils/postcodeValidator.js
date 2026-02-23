// Utility functions for postcode validation
const postcodeValidator = {
    // UK postcode format validation
    isUKPostcode: (postcode) => {
      // UK postcodes follow this general format: AA9A 9AA or A9A 9AA or A9 9AA or A99 9AA or AA9 9AA or AA99 9AA
      const ukPattern = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
      return ukPattern.test(postcode);
    },
  
    // US ZIP code validation
    isUSZipCode: (postcode) => {
      // US ZIP codes are either 5 digits or 5+4 format
      const usPattern = /^\d{5}(-\d{4})?$/;
      return usPattern.test(postcode);
    },
  
    // Canadian postal code validation
    isCanadianPostalCode: (postcode) => {
      // Canadian postal codes follow format: A9A 9A9
      const canadianPattern = /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/i;
      return canadianPattern.test(postcode);
    },
  
    // Australian postcode validation
    isAustralianPostcode: (postcode) => {
      // Australian postcodes are 4 digits
      const australianPattern = /^\d{4}$/;
      return australianPattern.test(postcode);
    },
  
    // Detect likely country based on postcode format
    detectCountry: (postcode) => {
      if (!postcode) return null;
      
      // Strip spaces for consistent checking
      const cleanedCode = postcode.trim();
      
      if (postcodeValidator.isUKPostcode(cleanedCode)) {
        return 'UK';
      } else if (postcodeValidator.isUSZipCode(cleanedCode)) {
        return 'US';
      } else if (postcodeValidator.isCanadianPostalCode(cleanedCode)) {
        return 'Canada';
      } else if (postcodeValidator.isAustralianPostcode(cleanedCode)) {
        return 'Australia';
      }
      
      // Return null if format is not recognized
      return null;
    },
  
    // Check if two postcodes are likely from different countries
    areLikelyFromDifferentCountries: (postcode1, postcode2) => {
      const country1 = postcodeValidator.detectCountry(postcode1);
      const country2 = postcodeValidator.detectCountry(postcode2);
      
      //detect one or both countries, can't be sure
      if (!country1 || !country2) {
        return false;
      }
      
      // Return true if the detected countries are different
      return country1 !== country2;
    }
  };
  
  export default postcodeValidator;