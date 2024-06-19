import React, { useState, useEffect, useContext, useRef } from 'react';
import { getCourts, setActiveUser, createReview, getCourtReviews } from './api'; // Importing API functions
import { Context } from './context'; // Importing context for authentication
import StarRating from './StarRating';

const PlayNow = () => {
    const { auth } = useContext(Context); // Accessing authentication context
    const [loading, setLoading] = useState(true); // State to track loading status
    const [query, setQuery] = useState(''); // State to store search query
    const [courts, setCourts] = useState([]); // State to store courts data
    const [filteredCourts, setFilteredCourts] = useState([]); // State to store filtered courts
    const [totalActiveUsers, setTotalActiveUsers] = useState(0); // State to store total active users
    const [isPolling, setIsPolling] = useState(true); // State to control polling for court updates
    const [isSearching, setIsSearching] = useState(false); // State to indicate if a search is active
    const [reviewText, setReviewText] = useState(''); // State to store review text
    const [selectedRating, setSelectedRating] = useState(5); // State to store selected rating
    const [courtReviews, setCourtReviews] = useState({}); // State to store court reviews
    const [showReviews, setShowReviews] = useState({}); // State to control showing/hiding of reviews
    const [showReviewForm, setShowReviewForm] = useState({}); // State to control showing/hiding of review form
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
                        return {
                            ...court,
                            userActive,
                            activeUsers,
                        };
                    });
                    setCourts(courtsWithData); // Update courts state with fetched data
                    if (!isSearching) {
                        setFilteredCourts(courtsWithData); // Update filtered courts only if not searching
                    }
                    const initialActiveUsers = courtsWithData.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                    setTotalActiveUsers(initialActiveUsers); // Calculate and update total active users
                } else {
                    console.error('No data received for courts');
                }
            } catch (error) {
                console.error('Failed to fetch courts:', error);
            } finally {
                setLoading(false); // Set loading to false when courts are fetched
            }
        };

        if (isPolling) {
            const intervalId = setInterval(() => {
                fetchCourts();
            }, 4000); // Polling interval set to 4 seconds

            return () => clearInterval(intervalId); // Cleanup function to clear interval when component unmounts or when isPolling changes
        }
    }, [auth, isPolling, isSearching]); // Dependencies: auth, isPolling, and isSearching state

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
            setIsSearching(false); // Reset searching state if query is empty
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
        setIsSearching(true); // Set searching state when a search is performed
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
                // Fetch the updated courts data after setting active status
                const updatedCourtsResponse = await getCourts({ auth });
                if (updatedCourtsResponse && Array.isArray(updatedCourtsResponse)) {
                    const userId = auth.userId;
                    const updatedCourts = updatedCourtsResponse.map(court => {
                        const userActive = court.active_users.some(user => user.id === userId);
                        const activeUsers = court.active_users.length;
                        return {
                            ...court,
                            userActive,
                            activeUsers,
                        };
                    });
                    setCourts(updatedCourts);
                    setFilteredCourts(updatedCourts);

                    const updatedActiveUsers = updatedCourts.reduce((count, court) => (court.userActive ? count + 1 : count), 0);
                    setTotalActiveUsers(updatedActiveUsers);
                } else {
                    console.error('Failed to update courts after setting active status');
                }

                setIsPolling(true);
            }
        } catch (error) {
            console.error('Failed to update user status at court:', error); // Log error if setting active user fails
            setIsPolling(true); // Ensure polling resumes on error
        }
    };

    const handleReviewInputChange = (event) => {
        setReviewText(event.target.value);
    };

    const handleCreateReview = async (courtId) => {
        try {
            const response = await createReview({ auth, courtId, rating: selectedRating, comment: reviewText });
            console.log('Review created:', response);
            setReviewText(''); // Clear review text after submission
            // Fetch updated reviews for the court
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
        // Render loading animation here
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Render the rest of the component
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
                    {filteredCourts.map(court => (
                        <li key={court.id} className="court-item">
                            <div className="court-info">
                                <div className="court-name">{court.name}</div>
                                <div className="court-location">{court.location}</div>
                                <div className="court-amenities"><strong>Amenities:</strong> {court.amenities}</div>
                                <div className="court-active-users"><strong>Active Users:</strong> {court.activeUsers}</div>
                            </div>
                            <div className="court-actions">
                                {court.userActive ? (
                                    <button className="leave-button" onClick={() => handleSetActive(court.id, court.userActive)}>
                                        Leave Game
                                    </button>
                                ) : (
                                    <button className="join-button" onClick={() => handleSetActive(court.id, court.userActive)}>
                                        Join Game
                                    </button>
                                )}
                                <button className="show-reviews-button" onClick={() => toggleShowReviews(court.id)}>
                                    {showReviews[court.id] ? 'Hide Reviews' : 'Show Reviews'}
                                </button>
                                {showReviews[court.id] && (
                                    <div className="reviews-section">
                                        {courtReviews[court.id] && courtReviews[court.id].length > 0 ? (
                                            <ul className="reviews-list">
                                                {courtReviews[court.id].map(review => (
                                                    <li key={review.id} className="review-item">
                                                        <div className="review-rating">
                                                            <StarRating rating={review.rating} />
                                                        </div>
                                                        <div className="review-comment">{review.comment}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No reviews available.</p>
                                        )}
                                        <button className="add-review-button" onClick={() => toggleShowReviewForm(court.id)}>
                                            {showReviewForm[court.id] ? 'Cancel Review' : 'Add Review'}
                                        </button>
                                        {showReviewForm[court.id] && (
                                            <div className="review-form">
                                                <StarRating rating={selectedRating} onRatingChange={handleRatingChange} />
                                                <textarea
                                                    className="review-textarea"
                                                    value={reviewText}
                                                    onChange={handleReviewInputChange}
                                                    placeholder="Write your review here..."
                                                />
                                                <button className="submit-review-button" onClick={() => handleCreateReview(court.id)}>
                                                    Submit Review
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="footer">
                <p>Total Active Users: {totalActiveUsers}</p>
            </div>
        </div>
    );
};

export default PlayNow;



