import { useContext, useState } from "react";
import StarRating from './StarRating';
import { setActiveUser, createReview } from "./api";
import { Context } from './context';

const Court = ({ 
    court, 
    courtReviews, 
    isPolling, 
    setCourts, 
    setFilteredCourts, 
    courts, 
    setTotalActiveUsers,
    fetchCourts, 
}) => {
    const [showReviews, setShowReviews] = useState({});
    const [showReviewForm, setShowReviewForm] = useState({});
    const [reviewText, setReviewText] = useState('');
    const [selectedRating, setSelectedRating] = useState(5);
    const { auth } = useContext(Context);

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

    const handleSetActive = async (courtId, currentActiveStatus) => {
        try {
            const response = await setActiveUser({ auth, courtId });
            console.log('HANDLE SET ACTIVE: RESPONSE: ', response)
            fetchCourts()
            if (response.error) {
                console.error('Error from setActiveUser:', response.error);
            } 

        } catch (error) {
            console.error('Failed to update user status at court:', error);
        }
    };

    return (
        <li key={court.id} className="court-item" style={{ padding: '20px' }}> {/* Added padding here */}
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


