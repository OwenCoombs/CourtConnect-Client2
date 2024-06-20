// Import necessary hooks and components from React and other files
import { useContext, useState } from "react";
import StarRating from './StarRating'; // Importing StarRating component
import { setActiveUser, createReview } from "./api"; // Importing API functions for setting active user and creating reviews
import { Context } from './context'; // Importing Context for authentication

// Define the Court component, receiving several props
const Court = ({ court, courtReviews, isPolling, setCourts, setFilteredCourts, courts, setTotalActiveUsers }) => {
    // State hooks for managing the visibility of reviews and review forms, review text, and selected rating
    const [showReviews, setShowReviews] = useState({});
    const [showReviewForm, setShowReviewForm] = useState({});
    const [reviewText, setReviewText] = useState('');
    const [selectedRating, setSelectedRating] = useState(5);
    // Retrieve authentication information from the context
    const { auth } = useContext(Context);

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
                const court = courts.find(court => court.id === courtId);
    
                // Check if the current user is among the active users for the specified court
                if (!court.active_users.some(user => user.id === userId)) {
                    console.warn('User is not active on this court. Button state will not be changed.');
                    return;
                }
    
                // Update courts list with user's active status for a specific court
                setCourts(prevCourts =>
                    prevCourts.map(court =>
                        court.id === courtId ? {
                            ...court,
                            active_users: newActiveStatus ? [...court.active_users, { id: userId }] : court.active_users.filter(user => user.id !== userId),
                            userActive: newActiveStatus
                        } : court
                    )
                );
                // Update filtered courts list with user's active status for a specific court
                setFilteredCourts(prevCourts =>
                    prevCourts.map(court =>
                        court.id === courtId ? {
                            ...court,
                            active_users: newActiveStatus ? [...court.active_users, { id: userId }] : court.active_users.filter(user => user.id !== userId),
                            userActive: newActiveStatus
                        } : court
                    )
                );
    
                // Count and update total active users across all courts
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
                {/* Button to set user as active or inactive */}
                <button
                    className={`court-action-button ${court.userActive ? 'leave' : 'play'}`}
                    onClick={() => handleSetActive(court.id, court.userActive)}
                    disabled={!isPolling}
                >
                    {court.userActive ? 'Leave Game' : 'Play Here!'}
                </button>

                <div className="active-users">
                    {/* Display number of active users */}
                    {Math.max(court.activeUsers, 0)} {court.activeUsers === 1 ? 'active user' : 'active users'}
                </div>
                <div className="review-section">
                    {/* Button to toggle review form visibility */}
                    {!showReviewForm[court.id] && (
                        <button className="leave-review-button" onClick={() => toggleShowReviewForm(court.id)}>
                            Leave a Review
                        </button>
                    )}
                    {/* Review form */}
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
                    {/* Display reviews */}
                    <div className="court-reviews">
                        <h5>Reviews:</h5>
                        <button className="toggle-reviews" onClick={() => toggleShowReviews(court.id)}>
                            {showReviews[court.id] ? 'Hide Reviews' : 'Show Reviews'}
                        </button>
                        {showReviews[court.id] && (
                            <ul>
                                {/* Map through and display each review */}
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

