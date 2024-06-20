import React, { useState, useEffect, useContext } from 'react';
import { getCourts, getCourtReviews } from './api'; // Import API functions for fetching courts and court reviews
import { Context } from './context'; // Import the context for accessing authentication information
import Court from './Court'; // Import the Court component to render individual courts

const PlayNow = () => {
    const { auth } = useContext(Context); // Get authentication information from the context
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [query, setQuery] = useState(''); // State to manage search query
    const [courts, setCourts] = useState([]); // State to store all courts
    const [filteredCourts, setFilteredCourts] = useState([]); // State to store filtered courts based on search query
    const [totalActiveUsers, setTotalActiveUsers] = useState(0); // State to store total active users across all courts
    const [isPolling, setIsPolling] = useState(true); // State to control data polling
    const [isSearching, setIsSearching] = useState(false); // State to track search state
    const [courtReviews, setCourtReviews] = useState({}); // State to store reviews for each court

    // useEffect hook to fetch courts data and start polling if enabled
    useEffect(() => {
        const fetchCourts = async () => {
            // Check if authentication token is available
            if (!auth || !auth.accessToken) {
                console.error('No access token provided');
                return;
            }
            try {
                // Fetch courts data from the API
                const response = await getCourts({ auth });
                if (response && Array.isArray(response)) {
                    // Process and update courts data
                    const userId = auth.userId;
                    const courtsWithData = response.map(court => {
                        const userActive = court.active_users.some(user => user.id === userId);
                        const activeUsers = court.active_users.length;
                        return {
                            ...court,
                            userActive,
                            activeUsers,
                        };
                    });
                    setCourts(courtsWithData);
                    // Update filtered courts if not in search mode
                    if (!isSearching) {
                        setFilteredCourts(courtsWithData);
                    }
                    // Calculate and update total active users count
                    const initialActiveUsers = courtsWithData.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                    setTotalActiveUsers(initialActiveUsers);
                } else {
                    console.error('No data received for courts');
                }
            } catch (error) {
                console.error('Failed to fetch courts:', error);
            } finally {
                setLoading(false); // Update loading state after fetching data
            }
        };

        if (isPolling) {
            // Start polling for courts data
            const intervalId = setInterval(() => {
                fetchCourts();
            }, 4000); // Polling interval set to 4 seconds
            return () => clearInterval(intervalId); // Clear interval on component unmount
        }
    }, [auth, isPolling, isSearching]); // Dependency array for useEffect hook

    // useEffect hook to fetch reviews for all courts when courts data or authentication changes
    useEffect(() => {
        const fetchReviewsForCourts = async () => {
            // Check if authentication token and courts data are available
            if (!auth || !auth.accessToken || !courts.length) {
                console.error('No access token provided or no courts available');
                return;
            }
            try {
                // Fetch reviews for each court in parallel
                const courtReviewsPromises = courts.map(async court => {
                    try {
                        const reviewsResponse = await getCourtReviews({ auth, courtId: court.id });
                        return { courtId: court.id, reviews: reviewsResponse.data };
                    } catch (error) {
                        console.error('Failed to fetch court reviews:', error);
                        return { courtId: court.id, reviews: [] };
                    }
                });
                const courtReviewsData = await Promise.all(courtReviewsPromises);
                // Process and update reviews data
                const reviewsData = courtReviewsData.reduce((acc, { courtId, reviews }) => {
                    acc[courtId] = reviews;
                    return acc;
                }, {});
                setCourtReviews(reviewsData);
            } catch (error) {
                console.error('Failed to fetch court reviews for all courts:', error);
            }
        };
        fetchReviewsForCourts();
    }, [auth, courts]); // Dependency array for useEffect hook

    // Handler for search input change
    const handleInputChange = (event) => {
        setQuery(event.target.value);
        if (event.target.value === '') {
            setIsSearching(false);
        }
    };

    // Handler for search button click
    const handleSearch = () => {
        const lowerCaseQuery = query.toLowerCase();
        // Filter courts based on search query and update filtered courts
        const filtered = courts.filter(court =>
            court.name.toLowerCase().includes(lowerCaseQuery) ||
            court.location.toLowerCase().includes(lowerCaseQuery) ||
            court.amenities.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredCourts(filtered);
        setIsSearching(true); // Update search state
    };

    // Render loading spinner if data is loading
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Render courts list and total active users count
    return (
        <div className="playnow-container">
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
                    {filteredCourts.map(court => (
                        <Court
                            key={court.id}
                            court={court}
                            courtReviews={courtReviews}
                            isPolling={isPolling}
                            setCourts={setCourts}
                            setFilteredCourts={setFilteredCourts}
                            courts={courts}
                            setTotalActiveUsers={setTotalActiveUsers}
                        />
                    ))}
                </ul>
            </div>
            <div>Total Active Users: {Math.max(totalActiveUsers, 0)}</div>
        </div>
    );
};

export default PlayNow;

