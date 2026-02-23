import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../common/DashboardHeader';
import DataCard from '../common/DataCard';
import DataTable from '../common/DataTable';
import LoadingSpinner from '../common/LoadingSpinner';

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    userCount: 0,
    eventCount: 0,
    recentUsers: [],
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const usersRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersRef);
        
        const recentUsersQuery = query(usersRef, orderBy('createdAt', 'desc'), limit(5));
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsersData = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const eventsRef = collection(db, 'events');
        const eventSnapshot = await getDocs(eventsRef);
        
        const recentEventsQuery = query(eventsRef, orderBy('createdAt', 'desc'), limit(5));
        const recentEventsSnapshot = await getDocs(recentEventsQuery);
        const recentEventsData = recentEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDashboardData({
          userCount: userSnapshot.size,
          eventCount: eventSnapshot.size,
          recentUsers: recentUsersData,
          recentEvents: recentEventsData
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const userTableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'createdAt', label: 'Created', format: (value) => new Date(value).toLocaleDateString() }
  ];

  const eventTableColumns = [
    { key: 'name', label: 'Event Name' },
    { key: 'date', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' }
  ];
  
  return (
    <div className="dashboard-container">
      <DashboardHeader 
        title="Admin Dashboard"
        links={[
          { to: "/admin/users", label: "Manage Users" },
          { to: "/admin/events", label: "Manage Events" }
        ]}
        onLogout={handleLogout}
      />
      
      {loading ? (
        <LoadingSpinner message="Loading dashboard data..." />
      ) : (
        <>
          <DataCard title="System Overview">
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{dashboardData.userCount}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{dashboardData.eventCount}</div>
                <div className="stat-label">Total Events</div>
              </div>
            </div>
          </DataCard>
          
          <DataCard 
            title="Recent Users"
            footerAction={<Link to="/admin/users" className="btn">View All Users</Link>}
          >
            <DataTable 
              columns={userTableColumns}
              data={dashboardData.recentUsers}
              emptyMessage="No users found."
            />
          </DataCard>
          
          <DataCard 
            title="Recent Events"
            footerAction={<Link to="/admin/events" className="btn">Manage Events</Link>}
          >
            <DataTable 
              columns={eventTableColumns}
              data={dashboardData.recentEvents}
              emptyMessage="No events found."
            />
          </DataCard>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;