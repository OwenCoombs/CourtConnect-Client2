// Import necessary hooks and components from React and other files
import { useContext, useState, useEffect } from "react";
import StarRating from './StarRating';
import { setActiveUser, createReview } from "./api";
import { Context } from './context';


// Define the Court component, receiving several props
const Court = ({ court, courtReviews, isPolling, setCourts, setFilteredCourts, courts, setTotalActiveUsers }) => {
    // State hooks for managing the visibility of reviews and review forms, review text, and selected rating
    const [showReviews, setShowReviews] = useState({});
    const [showReviewForm, setShowReviewForm] = useState({});
    const [reviewText, setReviewText] = useState('');
    const [selectedRating, setSelectedRating] = useState(5);
    // Retrieve authentication information from the context
    const { auth } = useContext(Context);
    useEffect(() => {
        console.log(`Court ${court.id} userActive:`, court.userActive);
    }, [court.userActive]);
    // Handle changes in the review text input field
    const handleReviewInputChange = (event) => {
        setReviewText(event.target.value);
    };

    // Handle the creation of a new review
    const handleCreateReview = async (courtId) => {
        try {
            // Create a review using the API
            const response = await createReview({ auth, courtId, rating: selectedRating, comment: reviewText });
            console.log('Review created:', response);
            // Reset the review text field
            setReviewText('');
            // Fetch and update the court reviews after creating the new review
            const reviewsResponse = await getCourtReviews({ auth, courtId });
            setCourtReviews(prevReviews => ({
                ...prevReviews,
                [courtId]: reviewsResponse.data
            }));
        } catch (error) {
            console.error('Failed to create review:', error);
        }
    };

    // Handle changes in the star rating component
    const handleRatingChange = (newRating) => {
        setSelectedRating(newRating);
    };

    // Toggle the visibility of the reviews for a specific court
    const toggleShowReviews = (courtId) => {
        setShowReviews(prevState => ({
            ...prevState,
            [courtId]: !prevState[courtId]
        }));
    };

    // Toggle the visibility of the review form for a specific court
    const toggleShowReviewForm = (courtId) => {
        setShowReviewForm(prevState => ({
            ...prevState,
            [courtId]: !prevState[courtId]
        }));
    };

    // Handle setting a user as active or inactive for a specific court
    const handleSetActive = async (courtId, currentActiveStatus) => {
        const newActiveStatus = !currentActiveStatus;

        try {
            const response = await setActiveUser({ auth, courtId, setActive: newActiveStatus });

            if (response.error) {
                console.error('Error from setActiveUser:', response.error);
            } else {
                const userId = auth.userId;
                setCourts(prevCourts =>
                    prevCourts.map(court =>
                        court.id === courtId ? {
                            ...court,
                            active_users: newActiveStatus ? [...court.active_users, { id: userId }] : court.active_users.filter(user => user.id !== userId),
                            userActive: newActiveStatus
                        } : court
                    )
                );

                setFilteredCourts(prevCourts =>
                    prevCourts.map(court =>
                        court.id === courtId ? {
                            ...court,
                            active_users: newActiveStatus ? [...court.active_users, { id: userId }] : court.active_users.filter(user => user.id !== userId),
                            userActive: newActiveStatus
                        } : court
                    )
                );

                const updatedActiveUsers = courts.reduce((count, court) => (court.active_users.some(user => user.id === userId) ? count + 1 : count), 0);
                setTotalActiveUsers(updatedActiveUsers);
            }
        } catch (error) {
            console.error('Failed to update user status at court:', error);
        }
    };

    // Render the court information and controls
    return (
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
    )
}

export default Court
