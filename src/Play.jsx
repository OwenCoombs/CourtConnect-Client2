import React, { useState, useEffect, useContext } from 'react';
import { getCourts, setActiveUser, createReview, getCourtReviews } from './api';
import { Context } from './context';
import StarRating from './StarRating';

const PlayNow = () => {
    const { auth } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [courts, setCourts] = useState([]);
    const [filteredCourts, setFilteredCourts] = useState([]);
    const [totalActiveUsers, setTotalActiveUsers] = useState(0);
    const [isPolling, setIsPolling] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [selectedRating, setSelectedRating] = useState(5);
    const [courtReviews, setCourtReviews] = useState({});
    const [showReviews, setShowReviews] = useState({});
    const [showReviewForm, setShowReviewForm] = useState({});

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

    const handleSetActive = async (courtId, currentActiveStatus) => {
        console.log('Setting active status for court:', courtId, 'Current status:', currentActiveStatus);
    
        const newActiveStatus = !currentActiveStatus;
    
        try {
            setIsPolling(false);
    
            // Call the setActiveUser API
            const response = await setActiveUser({ auth, courtId, setActive: newActiveStatus });
    
            console.log('API response from setActiveUser:', response);
    
            if (response.error) {
                console.error('Error from setActiveUser:', response.error);
                // Handle error condition if needed
            } else {
                // Update local state for courts and filteredCourts
                setCourts(prevCourts =>
                    prevCourts.map(court =>
                        court.id === courtId ? { ...court, userActive: newActiveStatus } : court
                    )
                );
    
                setFilteredCourts(prevCourts =>
                    prevCourts.map(court =>
                        court.id === courtId ? { ...court, userActive: newActiveStatus } : court
                    )
                );
    
                // Update total active users based on the updated courts data
                const updatedActiveUsers = courts.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                setTotalActiveUsers(updatedActiveUsers + (newActiveStatus ? 1 : -1)); // Adjust based on newActiveStatus
            }
    
            setIsPolling(true);
        } catch (error) {
            console.error('Failed to update user status at court:', error);
            setIsPolling(true);
        }
    };
    
    const handleReviewInputChange = (event) => {
        setReviewText(event.target.value);
    };

    const handleCreateReview = async (courtId) => {
        try {
            const response = await createReview({ auth, courtId, rating: selectedRating, comment: reviewText });
            console.log('Review created:', response);
            setReviewText('');
            const reviewsResponse = await getCourtReviews({ auth, courtId });
            setCourtReviews(prevReviews => ({
                ...prevReviews,
                [courtId]: reviewsResponse.data
            }));
        } catch (error) {
            console.error('Failed to create review:', error);
        }
    };

    const handleRatingChange = (newRating) => {
        setSelectedRating(newRating);
    };

    const toggleShowReviews = (courtId) => {
        setShowReviews(prevState => ({
            ...prevState,
            [courtId]: !prevState[courtId]
        }));
    };

    const toggleShowReviewForm = (courtId) => {
        setShowReviewForm(prevState => ({
            ...prevState,
            [courtId]: !prevState[courtId]
        }));
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
                        <li key={court.id} className="court-item">
                            <div className="court-info">
                                <div className="court-name">{court.name}</div>
                                <div className="court-location">{court.location}</div>
                                <div className="court-amenities"><strong>Amenities:</strong> {court.amenities}</div>
                                <button
                                    className={`court-action-button ${court.userActive ? 'leave' : 'play'}`}
                                    onClick={() => handleSetActive(court.id, court.userActive)}
                                    disabled={!isPolling}
                                >
                                    {court.userActive ? 'Leave Game' : 'Play Here!'}
                                </button>

                                <div className="active-users">
                                    {Math.max(court.activeUsers, 0)} {court.activeUsers === 1 ? 'active user' : 'active users'}
                                </div>
                                <div className="review-section">
                                    {!showReviewForm[court.id] && (
                                        <button className="leave-review-button" onClick={() => toggleShowReviewForm(court.id)}>
                                            Leave a Review
                                        </button>
                                    )}
                                    {showReviewForm[court.id] && (
                                        <div>
                                            <textarea
                                                className="review-textarea"
                                                placeholder="Write a review..."
                                                value={reviewText}
                                                onChange={handleReviewInputChange}
                                            ></textarea>
                                            <StarRating value={selectedRating} onChange={handleRatingChange} />
                                            <button
                                                className="review-submit-button"
                                                onClick={() => handleCreateReview(court.id)}
                                            >
                                                Submit Review
                                            </button>
                                        </div>
                                    )}
                                    <div className="court-reviews">
                                        <h5>Reviews:</h5>
                                        <button className="toggle-reviews" onClick={() => toggleShowReviews(court.id)}>
                                            {showReviews[court.id] ? 'Hide Reviews' : 'Show Reviews'}
                                        </button>
                                        {showReviews[court.id] && (
                                            <ul>
                                                {courtReviews[court.id] && courtReviews[court.id].map(review => (
                                                    <li key={review.id}>
                                                        <div>Rating: {review.rating}</div>
                                                        <div>Comment: {review.comment}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
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
