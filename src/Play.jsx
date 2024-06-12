import React, { useState, useEffect, useContext } from 'react';
import { getCourts, setActiveUser } from './api';
import { Context } from './context';

const PlayNow = () => {
    const { auth } = useContext(Context);
    const [query, setQuery] = useState('');
    const [courts, setCourts] = useState([]);
    const [totalActiveUsers, setTotalActiveUsers] = useState(0); // Initialize totalActiveUsers state

    // Fetch courts and initialize totalActiveUsers
    useEffect(() => {
        const fetchCourts = async () => {
            if (!auth || !auth.accessToken) {
                console.error('No access token provided');
                return;
            }
    
            try {
                const response = await getCourts({ auth });
                if (response && Array.isArray(response)) {
                    const storedActiveUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
                    const courtsWithData = response.map(court => {
                        const userActive = !!storedActiveUsers[court.id];
                        const activeUsers = userActive ? (court.activeUsers || 0) + 1 : (court.activeUsers || 0);
                        return {
                            ...court,
                            userActive,
                            activeUsers,
                        };
                    });
                    setCourts(courtsWithData);
    
                    // Calculate initial totalActiveUsers
                    const initialActiveUsers = courtsWithData.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                    setTotalActiveUsers(initialActiveUsers);
                } else {
                    console.error('No data received for courts');
                }
            } catch (error) {
                console.error('Failed to fetch courts:', error);
            }
        };
    
        fetchCourts();
    }, [auth]);
    

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSearch = () => {
        console.log('Searching for:', query);
    };

    const handleSetActive = async (courtId, currentActiveStatus) => {
        const payload = { auth, courtId, setActive: !currentActiveStatus };
    
        try {
            await setActiveUser(payload);
            const updatedCourts = courts.map(court => {
                if (court.id === courtId) {
                    const newStatus = !currentActiveStatus;
                    const updatedCourt = {
                        ...court,
                        userActive: newStatus,
                        activeUsers: newStatus ? (court.activeUsers || 0) + 1 : Math.max((court.activeUsers || 0) - 1, 0),
                    };
    
                    // Update local storage
                    const storedActiveUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
                    storedActiveUsers[courtId] = newStatus;
                    localStorage.setItem('activeUsers', JSON.stringify(storedActiveUsers));
    
                    return updatedCourt;
                }
                return court;
            });
            setCourts(updatedCourts);
    
            // Update totalActiveUsers count
            const updatedActiveUsers = updatedCourts.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
            setTotalActiveUsers(updatedActiveUsers);
        } catch (error) {
            console.error('Failed to update user status at court:', error);
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
            <div>Total Active Users: {totalActiveUsers}</div> {/* Display totalActiveUsers */}
        </div>
    );
};

export default PlayNow;