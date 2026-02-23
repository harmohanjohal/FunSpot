import React, { useState } from 'react';
import FormField from '../common/FormField';

function SearchForm({ onSearch, isLoading }) {
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    eventType: '',
    startDate: '',
    endDate: '',
    location: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    minAgeRating: '',
    maxAgeRating: '',
    hasFreeTickets: false,
    sortBy: 'date',
    sortOrder: 'asc'
  });
  
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Event type options for dropdown
  const eventTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
    { value: 'theater', label: 'Theater' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'conference', label: 'Conference' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'other', label: 'Other' }
  ];
  
  // Sort options for dropdown
  const sortByOptions = [
    { value: 'date', label: 'Date' },
    { value: 'price', label: 'Price' },
    { value: 'title', label: 'Title' },
    { value: 'location', label: 'Location' },
    { value: 'city', label: 'City' }
  ];
  
  const sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];
  
  // Handle input changes
  const handleChange = (field, value) => {
    setSearchCriteria({
      ...searchCriteria,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty criteria to avoid sending unnecessary parameters
    const filteredCriteria = Object.entries(searchCriteria)
      .filter(([_, value]) => {
        if (typeof value === 'boolean') return true;
        if (typeof value === 'number') return true;
        return value !== '';
      })
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    
    onSearch(filteredCriteria);
  };
  
  // Reset search form
  const handleReset = () => {
    setSearchCriteria({
      title: '',
      eventType: '', // Changed from 'type' to 'eventType'
      startDate: '',
      endDate: '',
      location: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      minAgeRating: '',
      maxAgeRating: '',
      hasFreeTickets: false,
      sortBy: 'date',
      sortOrder: 'asc'
    });
    
    // Submit with empty criteria to show all events
    onSearch({});
  };
  
  // Toggle advanced search mode
  const toggleAdvancedMode = () => {
    setAdvancedMode(!advancedMode);
  };
  
  return (
    <div className="search-form">
      <form onSubmit={handleSubmit}>
        <div className="search-basic" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 2 }}>
            <FormField
              id="title"
              placeholder="Search by event name..."
              value={searchCriteria.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <FormField
              id="eventType" // Changed from 'type' to 'eventType'
              type="select"
              value={searchCriteria.eventType} // Changed from 'type' to 'eventType'
              onChange={(e) => handleChange('eventType', e.target.value)} // Changed from 'type' to 'eventType'
              options={eventTypeOptions}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={isLoading}
            style={{ marginLeft: '5px' }}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleReset}
            style={{ marginLeft: '5px' }}
          >
            Reset
          </button>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={toggleAdvancedMode}
            style={{ background: 'transparent', color: '#1da1f2', padding: '0' }}
          >
            {advancedMode ? '- Hide Advanced Search' : '+ Advanced Search'}
          </button>
        </div>
        
        {advancedMode && (
          <div className="search-advanced">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <FormField
                id="startDate"
                label="Start Date"
                type="date"
                value={searchCriteria.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
              
              <FormField
                id="endDate"
                label="End Date"
                type="date"
                value={searchCriteria.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
              
              <FormField
                id="location"
                label="Location"
                value={searchCriteria.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Search in venue name/address"
              />
              
              <FormField
                id="city"
                label="City"
                value={searchCriteria.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              
              <FormField
                id="minPrice"
                label="Min Price"
                type="number"
                value={searchCriteria.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                min="0"
              />
              
              <FormField
                id="maxPrice"
                label="Max Price"
                type="number"
                value={searchCriteria.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                min="0"
              />
              
              <FormField
                id="minAgeRating"
                label="Min Age Rating"
                type="number"
                value={searchCriteria.minAgeRating}
                onChange={(e) => handleChange('minAgeRating', e.target.value)}
                min="0"
              />
              
              <FormField
                id="maxAgeRating"
                label="Max Age Rating"
                type="number"
                value={searchCriteria.maxAgeRating}
                onChange={(e) => handleChange('maxAgeRating', e.target.value)}
                min="0"
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <FormField
                id="hasFreeTickets"
                label="Free Tickets Only"
                type="checkbox"
                value={searchCriteria.hasFreeTickets}
                onChange={(e) => handleChange('hasFreeTickets', e.target.checked)}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="sortBy" style={{ marginBottom: 0, marginRight: '5px' }}>Sort By:</label>
                <div style={{ width: '120px' }}>
                  <FormField
                    id="sortBy"
                    type="select"
                    value={searchCriteria.sortBy}
                    onChange={(e) => handleChange('sortBy', e.target.value)}
                    options={sortByOptions}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="sortOrder" style={{ marginBottom: 0, marginRight: '5px' }}>Order:</label>
                <div style={{ width: '120px' }}>
                  <FormField
                    id="sortOrder"
                    type="select"
                    value={searchCriteria.sortOrder}
                    onChange={(e) => handleChange('sortOrder', e.target.value)}
                    options={sortOrderOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchForm;