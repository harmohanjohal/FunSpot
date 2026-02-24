import React from 'react';
import FormField from '../common/FormField';

function EventForm({ form, updateForm, eventTypes, statusOptions, currencyOptions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <FormField
          id="name"
          label="Event Name*"
          type="text"
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
          required
        />

        <FormField
          id="date"
          label="Date*"
          type="date"
          value={form.date}
          onChange={(e) => updateForm('date', e.target.value)}
          required
        />

        <FormField
          id="location"
          label="Location*"
          type="text"
          value={form.location}
          onChange={(e) => updateForm('location', e.target.value)}
          required
        />

        <FormField
          id="venueAddress"
          label="Venue Address"
          type="text"
          value={form.venueAddress}
          onChange={(e) => updateForm('venueAddress', e.target.value)}
        />

        <FormField
          id="city"
          label="City"
          type="text"
          value={form.city}
          onChange={(e) => updateForm('city', e.target.value)}
        />

        <FormField
          id="postcode"
          label="Postcode"
          type="text"
          value={form.postcode}
          onChange={(e) => updateForm('postcode', e.target.value)}
        />

        <FormField
          id="type"
          label="Event Type"
          type="select"
          value={form.type}
          onChange={(e) => updateForm('type', e.target.value)}
          options={eventTypes}
        />

        <FormField
          id="status"
          label="Status"
          type="select"
          value={form.status}
          onChange={(e) => updateForm('status', e.target.value)}
          options={statusOptions}
        />

        <FormField
          id="ticketPrice"
          label="Ticket Price"
          type="text"
          value={form.ticketPrice}
          onChange={(e) => updateForm('ticketPrice', e.target.value)}
        />

        <FormField
          id="currency"
          label="Currency"
          type="select"
          value={form.currency}
          onChange={(e) => updateForm('currency', e.target.value)}
          options={currencyOptions || [
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
            { value: 'GBP', label: 'GBP' }
          ]}
        />

        <FormField
          id="totalTickets"
          label="Total Tickets"
          type="text"
          value={form.totalTickets}
          onChange={(e) => updateForm('totalTickets', e.target.value)}
        />

        <FormField
          id="ageRating"
          label="Age Rating"
          type="text"
          value={form.ageRating}
          onChange={(e) => updateForm('ageRating', e.target.value)}
        />

        <FormField
          id="durationMinutes"
          label="Duration (minutes)"
          type="number"
          value={form.durationMinutes}
          onChange={(e) => updateForm('durationMinutes', e.target.value)}
        />
      </div>

      <div className="mt-5">
        <FormField
          id="description"
          label="Description"
          type="textarea"
          value={form.description}
          onChange={(e) => updateForm('description', e.target.value)}
        />
      </div>
    </div>
  );
}

export default EventForm;