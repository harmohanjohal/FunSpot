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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full md:w-2/5">
            <FormField
              id="title"
              placeholder="Search by event name..."
              value={searchCriteria.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/4">
            <FormField
              id="eventType"
              type="select"
              value={searchCriteria.eventType}
              onChange={(e) => handleChange('eventType', e.target.value)}
              options={eventTypeOptions}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 h-[42px]"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>

            <button
              type="button"
              className="flex-none px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors border border-gray-200 h-[42px]"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            onClick={toggleAdvancedMode}
          >
            {advancedMode ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg> Hide Advanced Search</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> Advanced Search</>
            )}
          </button>
        </div>

        {advancedMode && (
          <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-gray-200 mt-4 gap-4">
              <div className="flex items-center">
                <FormField
                  id="hasFreeTickets"
                  label="Free Tickets Only"
                  type="checkbox"
                  value={searchCriteria.hasFreeTickets}
                  onChange={(e) => handleChange('hasFreeTickets', e.target.checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort By:</label>
                  <div className="w-32">
                    <FormField
                      id="sortBy"
                      type="select"
                      value={searchCriteria.sortBy}
                      onChange={(e) => handleChange('sortBy', e.target.value)}
                      options={sortByOptions}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700 whitespace-nowrap">Order:</label>
                  <div className="w-32">
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
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchForm;