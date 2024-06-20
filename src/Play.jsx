import React, { useState, useEffect, useContext, useRef } from 'react';
import { getCourts, setActiveUser } from './api'; // Importing API functions for fetching courts and setting active user
import { Context } from './context'; // Importing context for authentication

const PlayNow = () => {
    const { auth } = useContext(Context); // Accessing authentication context
    const [query, setQuery] = useState(''); // State to store search query
    const [courts, setCourts] = useState([]); // State to store courts data
    const [totalActiveUsers, setTotalActiveUsers] = useState(0); // State to store total active users
    const [isPolling, setIsPolling] = useState(true); // State to control polling for court updates
    const localChangesRef = useRef({}); // Ref to track local changes

    useEffect(() => {
        const fetchCourts = async () => {
            if (!auth || !auth.accessToken) {
                console.error('No access token provided');
                return;
            }
            try {
                const response = await getCourts({ auth }); // Fetch courts data
                if (response && Array.isArray(response)) {
                    const userId = auth.userId;
                    const courtsWithData = response.map(court => {
                        const userActive = court.active_users.some(user => user.id === userId); // Check if current user is active in this court
                        const activeUsers = court.active_users.length; // Count total active users in this court
                        const localChange = localChangesRef.current[court.id];
                        return {
                            ...court,
                            userActive: localChange !== undefined ? localChange : userActive,
                            activeUsers: localChange !== undefined
                                ? (localChange ? activeUsers + 1 : activeUsers - 1)
                                : activeUsers,
                        };
                    });
                    setCourts(courtsWithData); // Update courts state with fetched data
                    const initialActiveUsers = courtsWithData.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                    setTotalActiveUsers(initialActiveUsers); // Calculate and update total active users
                } else {
                    console.error('No data received for courts');
                }
            } catch (error) {
                console.error('Failed to fetch courts:', error);
            }
        };

        if (isPolling) {
            const intervalId = setInterval(() => {
                fetchCourts();
            }, 10000); // Polling interval set to 10 seconds

            return () => clearInterval(intervalId); // Cleanup function to clear interval when component unmounts or when isPolling changes
        }
    }, [auth, isPolling]); // Dependencies: auth and isPolling state

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSearch = () => {
        console.log('Searching for:', query);
    };

    const handleSetActive = async (courtId, currentActiveStatus) => {
        console.log('Setting active status for court:', courtId, 'Current status:', currentActiveStatus);

        const newActiveStatus = !currentActiveStatus; // Determine new active status based on current status

        try {
            setIsPolling(false); // Temporarily stop polling to avoid conflicts during update

            // Track local change
            localChangesRef.current[courtId] = newActiveStatus;

            const response = await setActiveUser({ auth, courtId, setActive: newActiveStatus }); // Call API to set active user

            console.log('API response:', response);

            if (response.error) {
                console.error(response.error); // Log error if API request fails
            } else {
                // Update courts state with new active status
                const updatedCourts = courts.map(court => {
                    if (court.id === courtId) {
                        const updatedActiveUsers = newActiveStatus
                            ? court.activeUsers + 1
                            : Math.max(court.activeUsers - 1, 0); // Ensure activeUsers doesn't go below zero
                        return {
                            ...court,
                            userActive: newActiveStatus,
                            activeUsers: updatedActiveUsers,
                        };
                    }
                    return court;
                });

                console.log('Updated courts:', updatedCourts);

                setCourts(updatedCourts); // Update courts state with updated data

                const updatedActiveUsers = updatedCourts.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                setTotalActiveUsers(updatedActiveUsers); // Update total active users count

                setIsPolling(true); // Resume polling
            }
        } catch (error) {
            console.error('Failed to update user status at court:', error); // Log error if setting active user fails
            setIsPolling(true); // Ensure polling resumes on error
        }
    };

    return (
        <div className="play-now-container">
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search Courts..."
                />
                <button className="search-button" onClick={handleSearch}>
                    🔍
                </button>
            </div>
            <div className="courts-section">
                <h4>Popular Courts:</h4>
                <ul className="courts-container">
                    {courts.map(court => (
                        <li key={court.id} className="court-item">
                            <div className="court-info">
                                <div className="court-name">{court.name}</div>
                                <div className="court-location">{court.location}</div>
                                <div className="court-amenities"><strong>Amenities:</strong> {court.amenities}</div>
                                <button
                                    className={`court-action-button ${court.userActive ? 'leave' : 'play'}`}
                                    onClick={() => handleSetActive(court.id, court.userActive)}
                                    disabled={!isPolling} // Disable button while updating
                                >
                                    {court.userActive ? 'Leave Game' : 'Play Here!'}
                                </button>
                                <div className="active-users">
                                    {Math.max(court.activeUsers, 0)} {court.activeUsers === 1 ? 'active user' : 'active users'}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div>Total Active Users: {Math.max(totalActiveUsers, 0)}</div>
        </div>
    );
};

export default PlayNow;