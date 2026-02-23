import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../common/DashboardHeader';
import DataCard from '../common/DataCard';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import EventForm from './EventForm'; 
import useForm from '../../hooks/useForm';
import useModal from '../../hooks/useModal';
import useAlert from '../../hooks/useAlert';
import usePagination from '../../hooks/usePagination';
import { getEvents, formatDate } from '../../api/eventService';
import { createEvent, deleteEvent, updateEvent } from '../../api/adminEventService';
import '../css/responsive.css'; 

const emptyEventForm = {
  name: '',
  date: '',
  location: '',
  venueAddress: '',
  city: '',
  postcode: '',
  ageRating: '',
  ticketPrice: '',
  totalTickets: '100',
  status: 'upcoming',
  type: '',
  currency: 'USD',
  description: '',
  durationMinutes: '120'
};

const statusOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' }
];

const typeOptions = [
  { value: '', label: 'Select Type' },
  { value: 'concert', label: 'Concert' },
  { value: 'sports', label: 'Sports' },
  { value: 'theater', label: 'Theater' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'conference', label: 'Conference' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'convention', label: 'Convention' },
  { value: 'other', label: 'Other' }
];

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' }
];

function EventManagement() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);

  const { form, updateForm, resetForm, setForm } = useForm(emptyEventForm);
  const { isOpen: isAddModalOpen, open: openAddModal, close: closeAddModal } = useModal();
  const { isOpen: isEditModalOpen, open: openEditModal, close: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, open: openDeleteModal, close: closeDeleteModal } = useModal();
  const { alert, showSuccess, showError, clearAlert } = useAlert();

  const EVENTS_PER_PAGE = 10;
  const {
    page,
    setPage,
    firstDoc,
    setFirstDoc,
    lastDoc,
    setLastDoc,
    hasMore,
    setHasMore
  } = usePagination();

  // Delete confirmation state
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Fetch events with pagination
  const fetchEvents = async (pageDirection) => {
    try {
      setLoading(true);
      clearAlert();

      // Calculate the new page
      let newPage = page;
      if (pageDirection === 'next') {
        newPage = page + 1;
      } else if (pageDirection === 'prev') {
        newPage = Math.max(1, page - 1);
      }

      // Call API to get events
      const eventsData = await getEvents(null, newPage);

      // Update state with the fetched data
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setPage(newPage);
      setHasMore(Array.isArray(eventsData) && eventsData.length > 0);
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle add event
  const handleAddEvent = () => {
    resetForm(emptyEventForm);
    openAddModal();
  };

  // Handle edit event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setForm({
      name: event.title || '',
      date: event.date ? event.date.split('T')[0] : '',
      location: event.location || '',
      venueAddress: event.venueAddress || '',
      city: event.city || '',
      ageRating: event.ageRating?.toString() || '',
      ticketPrice: event.ticketPrice?.toString() || '',
      totalTickets: event.totalTickets?.toString() || '100',
      status: event.status || 'upcoming',
      type: event.eventType || '',
      postcode: event.postcode || '',
      currency: event.currency || 'USD',
      description: event.description || '',
      durationMinutes: event.durationMinutes?.toString() || '120'
    });
    openEditModal();
  };

  const handleSaveNewEvent = async () => {
    if (!form.name || !form.date || !form.location) {
      showError('Name, date, and location are required');
      return;
    }

    try {
      setLoading(true);

      const eventData = {
        title: form.name,
        date: form.date + "T19:00:00", 
        location: form.location,
        city: form.city || form.location.split(',')[1]?.trim() || "Unknown",
        venueAddress: form.venueAddress || "",
        eventType: form.type || "other",
        ticketPrice: parseFloat(form.ticketPrice) || 0,
        totalTickets: parseInt(form.totalTickets) || 100,
        ageRating: parseInt(form.ageRating) || 0,
        status: form.status || "upcoming",
        postcode: form.postcode || "",
        currency: form.currency || "USD",
        description: form.description || "",
        durationMinutes: parseInt(form.durationMinutes) || 120
      };

      const response = await createEvent(eventData);

      if (response.success) {
        fetchEvents();
        showSuccess('Event added successfully');
        closeAddModal();
      } else {
        showError(response.error || 'Failed to add event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      showError('Failed to add event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditedEvent = async () => {
    if (!editingEvent) return;

    if (!form.name || !form.date || !form.location) {
      showError('Name, date, and location are required');
      return;
    }

    try {
      setLoading(true);

      const eventData = {
        eventId: editingEvent.eventId,
        title: form.name,
        date: form.date + "T19:00:00", 
        location: form.location,
        city: form.city || form.location.split(',')[1]?.trim() || "Unknown",
        venueAddress: form.venueAddress || "",
        eventType: form.type || "other",
        ticketPrice: parseFloat(form.ticketPrice) || 0,
        totalTickets: parseInt(form.totalTickets) || 100,
        ageRating: parseInt(form.ageRating) || 0,
        currency: form.currency || editingEvent.currency || "USD",
        status: form.status || "upcoming",
        postcode: form.postcode || "",
        description: form.description || "",
        durationMinutes: parseInt(form.durationMinutes) || 120
      };

      const response = await updateEvent(editingEvent.eventId, eventData);

      if (response.success) {
        fetchEvents();
        showSuccess('Event updated successfully');
        closeEditModal();
        setEditingEvent(null);
      } else {
        showError(response.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showError('Failed to update event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setDeleteEventId(eventId);
    setDeleteConfirmation('');
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation !== 'delete') {
      showError('Please type "delete" to confirm');
      return;
    }

    if (!deleteEventId) return;

    try {
      setLoading(true);

      const response = await deleteEvent(deleteEventId);

      if (response && response.success) {
        fetchEvents();
        showSuccess('Event deleted successfully');
        closeDeleteModal();
        setDeleteEventId(null);
        setDeleteConfirmation('');
      } else {
        showError((response && response.error) || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const eventColumns = [
    { key: 'title', label: 'Name' },
    {
      key: 'date',
      label: 'Date',
      format: (value) => formatDate(value)
    },
    { key: 'location', label: 'Location' },
    { key: 'ageRating', label: 'Age Rating' },
    {
      key: 'ticketPrice',
      label: 'Ticket Price',
      format: (value, row) => {
        if (value === undefined || value === null) return 'N/A';
        return `${value} ${row && row.currency ? row.currency : 'USD'}`;
      }
    },
    { key: 'status', label: 'Status' },
    { key: 'eventType', label: 'Type' }
  ];

  const renderActions = (event) => (
    <>
      <button
        onClick={() => handleEditEvent(event)}
        className="btn btn-secondary"
        style={{ marginRight: '5px' }}
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteEvent(event.eventId)}
        className="btn btn-danger"
      >
        Delete
      </button>
    </>
  );

  return (
    <div className="dashboard-container">
      <DashboardHeader
        title="Event Management"
        links={[
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/users", label: "Manage Users" }
        ]}
        onLogout={handleLogout}
      />

      {alert.show && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <DataCard
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Event List</h3>
            <button onClick={handleAddEvent} className="btn">Add New Event</button>
          </div>
        }
      >
        {loading && !isAddModalOpen && !isEditModalOpen && !isDeleteModalOpen ? (
          <div>Loading events...</div>
        ) : (
          <>
            <DataTable
              columns={eventColumns}
              data={events}
              emptyMessage="No events found"
              actions={renderActions}
            />

            <div className="pagination">
              <button
                onClick={() => fetchEvents('prev')}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span style={{ margin: '0 10px' }}>Page {page}</span>
              <button
                onClick={() => fetchEvents('next')}
                disabled={!hasMore}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        )}
      </DataCard>

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Add New Event"
        onClose={closeAddModal}
        footer={
          <div className="form-buttons">
            <button onClick={closeAddModal} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveNewEvent} className="btn">Add Event</button>
          </div>
        }
      >
        {}
        <EventForm 
          form={form} 
          updateForm={updateForm} 
          eventTypes={typeOptions}
          statusOptions={statusOptions}
          currencyOptions={currencyOptions}
        />
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Edit Event"
        onClose={closeEditModal}
        footer={
          <div className="form-buttons">
            <button onClick={closeEditModal} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveEditedEvent} className="btn">Save Changes</button>
          </div>
        }
      >
        {/* Use the new EventForm component */}
        <EventForm 
          form={form} 
          updateForm={updateForm} 
          eventTypes={typeOptions}
          statusOptions={statusOptions}
          currencyOptions={currencyOptions}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Event"
        onClose={closeDeleteModal}
        footer={
          <div className="form-buttons">
            <button onClick={closeDeleteModal} className="btn btn-secondary">Cancel</button>
            <button onClick={handleConfirmDelete} className="btn btn-danger">Confirm Delete</button>
          </div>
        }
      >
        <p>Are you sure you want to delete this event? This action cannot be undone.</p>
        <p>Please type "delete" to confirm:</p>
        <FormField
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default EventManagement;