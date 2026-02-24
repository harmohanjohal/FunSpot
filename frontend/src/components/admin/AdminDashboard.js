import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../common/DashboardHeader';
import DataCard from '../common/DataCard';
import DataTable from '../common/DataTable';
import { SkeletonStatBox, SkeletonRow } from '../common/SkeletonLoader';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        title="Admin Dashboard"
        links={[
          { to: "/admin/users", label: "Manage Users" },
          { to: "/admin/events", label: "Manage Events" }
        ]}
        onLogout={handleLogout}
      />

      {loading ? (
        <div className="space-y-8">
          <DataCard title="System Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SkeletonStatBox />
              <SkeletonStatBox />
            </div>
          </DataCard>
          <DataCard title="Recent Data">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <SkeletonRow columns={4} />
                  <SkeletonRow columns={4} />
                  <SkeletonRow columns={4} />
                </tbody>
              </table>
            </div>
          </DataCard>
        </div>
      ) : (
        <div className="space-y-8">
          <DataCard title="System Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="text-4xl font-extrabold text-blue-700 mb-2">{dashboardData.userCount}</div>
                <div className="text-blue-600 font-medium tracking-wide uppercase text-sm">Total Users</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-center transition-transform hover:-translate-y-1 duration-300">
                <div className="text-4xl font-extrabold text-purple-700 mb-2">{dashboardData.eventCount}</div>
                <div className="text-purple-600 font-medium tracking-wide uppercase text-sm">Total Events</div>
              </div>
            </div>
          </DataCard>

          <DataCard
            title="Recent Users"
            footerAction={<Link to="/admin/users" className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">View All Users</Link>}
          >
            <DataTable
              columns={userTableColumns}
              data={dashboardData.recentUsers}
              emptyMessage="No users found."
            />
          </DataCard>

          <DataCard
            title="Recent Events"
            footerAction={<Link to="/admin/events" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2">Manage Events</Link>}
          >
            <DataTable
              columns={eventTableColumns}
              data={dashboardData.recentEvents}
              emptyMessage="No events found."
            />
          </DataCard>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;