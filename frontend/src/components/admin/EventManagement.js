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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        title="Event Management"
        links={[
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/users", label: "Manage Users" }
        ]}
        onLogout={handleLogout}
      />

      {alert.show && (
        <div className={`p-4 mb-6 rounded-lg font-medium flex items-center gap-2 ${alert.type === 'danger' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
          {alert.type === 'danger' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          )}
          {alert.message}
        </div>
      )}

      <DataCard
        title={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800 m-0">Event List</h3>
            <button onClick={handleAddEvent} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add New Event
            </button>
          </div>
        }
      >
        {loading && !isAddModalOpen && !isEditModalOpen && !isDeleteModalOpen ? (
          <div className="py-12 flex justify-center text-gray-500 font-medium">Loading events...</div>
        ) : (
          <>
            <DataTable
              columns={eventColumns}
              data={events}
              emptyMessage="No events found"
              actions={renderActions}
            />

            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => fetchEvents('prev')}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchEvents('next')}
                  disabled={!hasMore}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => fetchEvents('prev')}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      {page}
                    </span>
                    <button
                      onClick={() => fetchEvents('next')}
                      disabled={!hasMore}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <button onClick={closeAddModal} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveNewEvent} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto flex justify-center items-center">
              {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Add Event
            </button>
          </div>
        }
      >
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <button onClick={closeEditModal} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveEditedEvent} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto flex justify-center items-center">
              {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Save Changes
            </button>
          </div>
        }
      >
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <button onClick={closeDeleteModal} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors w-full sm:w-auto">Cancel</button>
            <button onClick={handleConfirmDelete} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto disabled:opacity-50">Confirm Delete</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex gap-3">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
              <h4 className="font-bold text-red-900 mb-1">Warning: Destructive Action</h4>
              <p className="text-sm">Are you sure you want to delete this event? This action cannot be undone and will remove all associated data, including tickets and bookings.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Please type "delete" to confirm:</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="delete"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EventManagement;