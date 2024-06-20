import React, { useState, useEffect, useContext } from 'react';
import { getCourts, setActiveUser, createReview, getCourtReviews } from './api';
import { Context } from './context';
import Court from './Court';

const PlayNow = () => {
    const { auth } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [courts, setCourts] = useState([]);
    const [filteredCourts, setFilteredCourts] = useState([]);
    const [totalActiveUsers, setTotalActiveUsers] = useState(0);
    const [isPolling, setIsPolling] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [courtReviews, setCourtReviews] = useState({});
    useEffect(() => {
        const fetchCourts = async () => {
            if (!auth || !auth.accessToken) {
                console.error('No access token provided');
                return;
            }
            try {
                const response = await getCourts({ auth });
                if (response && Array.isArray(response)) {
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
                    if (!isSearching) {
                        setFilteredCourts(courtsWithData);
                    }
                    const initialActiveUsers = courtsWithData.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                    setTotalActiveUsers(initialActiveUsers);
                } else {
                    console.error('No data received for courts');
                }
            } catch (error) {
                console.error('Failed to fetch courts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isPolling) {
            const intervalId = setInterval(() => {
                fetchCourts();
            }, 4000);
            return () => clearInterval(intervalId);
        }
    }, [auth, isPolling, isSearching]);

    useEffect(() => {
        const fetchReviewsForCourts = async () => {
            if (!auth || !auth.accessToken || !courts.length) {
                console.error('No access token provided or no courts available');
                return;
            }
            try {
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
    }, [auth, courts]);

    const handleInputChange = (event) => {
        setQuery(event.target.value);
        if (event.target.value === '') {
            setIsSearching(false);
        }
    };

    const handleSearch = () => {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = courts.filter(court =>
            court.name.toLowerCase().includes(lowerCaseQuery) ||
            court.location.toLowerCase().includes(lowerCaseQuery) ||
            court.amenities.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredCourts(filtered);
        setIsSearching(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

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


