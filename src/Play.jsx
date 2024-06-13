import React, { useState, useEffect, useContext } from 'react';
import { getCourts, setActiveUser } from './api';
import { Context } from './context';

const PlayNow = () => {
    // Extracting auth object from context
    const { auth } = useContext(Context);
    // State variables to manage query, courts data, and total active users
    const [query, setQuery] = useState('');
    const [courts, setCourts] = useState([]);
    const [totalActiveUsers, setTotalActiveUsers] = useState(0);

    // Function to fetch courts data from the backend
    const fetchCourts = async () => {
        // Ensure there's an access token available
        if (!auth || !auth.accessToken) {
            console.error('No access token provided');
            return;
        }

        try {
            // Call the getCourts API with the authentication token
            const response = await getCourts({ auth });
            // Check if the response is an array
            if (response && Array.isArray(response)) {
                // Retrieve stored active users from localStorage
                const storedActiveUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
                // Map through courts data to add user active status and active users count
                const courtsWithData = response.map(court => {
                    const userActive = !!storedActiveUsers[court.id];
                    const activeUsers = userActive ? (court.activeUsers || 0) + 1 : (court.activeUsers || 0);
                    return {
                        ...court,
                        userActive,
                        activeUsers,
                    };
                });

                // Update the courts state with the new data
                setCourts(courtsWithData);
                // Calculate initial active users count
                const initialActiveUsers = courtsWithData.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                // Update the totalActiveUsers state with the initial count
                setTotalActiveUsers(initialActiveUsers);
            } else {
                console.error('No data received for courts');
            }
        } catch (error) {
            console.error('Failed to fetch courts:', error);
        }
    };

    // useEffect to fetch courts data on component mount and set interval to refresh data every 10 seconds
    useEffect(() => {
        fetchCourts();

        const intervalId = setInterval(fetchCourts, 10000); // Fetch updated data every 10 seconds

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [auth]);

    // Handle input change for search query
    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    // Handle search button click
    const handleSearch = () => {
        console.log('Searching for:', query);
    };

    // Handle setting user active status for a court
    const handleSetActive = async (courtId, currentActiveStatus) => {
        const payload = { auth, courtId, setActive: !currentActiveStatus };

        try {
            // Call the setActiveUser API to update the user's status
            await setActiveUser(payload);
            // Update courts data with new active status
            let updatedCourts = courts.map(court => {
                if (court.id === courtId) {
                    const newStatus = !currentActiveStatus;
                    const updatedCourt = {
                        ...court,
                        userActive: newStatus,
                        activeUsers: newStatus ? (court.activeUsers || 0) + 1 : Math.max((court.activeUsers || 0) - 1, 0),
                    };

                    // Update localStorage with new active status
                    const storedActiveUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
                    storedActiveUsers[courtId] = newStatus;
                    localStorage.setItem('activeUsers', JSON.stringify(storedActiveUsers));

                    return updatedCourt;
                }
                return court;
            });

            // Update the courts state
            setCourts(updatedCourts);

            // Calculate updated total active users from the updated courts array
            const updatedActiveUsers = updatedCourts.reduce((count, court) => (court.userActive ? count + 1 : count), 0);

            // Update the totalActiveUsers state
            setTotalActiveUsers(updatedActiveUsers);
        } catch (error) {
            if (error.response && error.response.data.error === "User is already active at this court.") {
                // User is already active at the court, no need to update UI
                console.error('User is already active at this court:', error);
            } else {
                // Other errors, log and handle as needed
                console.error('Failed to update user status at court:', error);
            }
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
                                >
                                    {court.userActive ? 'Leave Game' : 'Play Here!'}
                                </button>
                                <div className="active-users">
                                    {court.activeUsers} {court.activeUsers === 1 ? 'active user' : 'active users'}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div>Total Active Users: {totalActiveUsers}</div>
        </div>
    );
};

export default PlayNow;


