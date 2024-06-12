import React, { useState, useEffect, useContext } from 'react';
import { getCourts, setActiveUser } from './api';
import { Context } from './context';

const PlayNow = () => {
    const { auth } = useContext(Context);
    const [query, setQuery] = useState('');
    const [courts, setCourts] = useState([]);

    useEffect(() => {
        const fetchCourts = async () => {
            if (!auth || !auth.accessToken) {
                console.error('No access token provided');
                return;
            }

            try {
                const response = await getCourts({ auth });
                if (response && Array.isArray(response)) {
                    const courtsWithData = response.map(court => ({
                        ...court,
                        userActive: false,
                        activeUsers: 0, // Initialize activeUsers count
                    }));
                    setCourts(courtsWithData);
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
                    return {
                        ...court,
                        userActive: !currentActiveStatus,
                        activeUsers: currentActiveStatus ? court.activeUsers - 1 : court.activeUsers + 1,
                    };
                }
                return court;
            });
            setCourts(updatedCourts);
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
        </div>
    );
};

export default PlayNow;





