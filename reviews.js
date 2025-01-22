const productId = 1; 

async function fetchReviews(productId) {
    try {
        const response = await fetch(`/api/reviews/${productId}`);
        const data = await response.json();
        
        if (data.reviews && Array.isArray(data.reviews)) {
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.innerHTML = ''; // Clear previous reviews

            data.reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.classList.add('review-card');
                reviewDiv.innerHTML = `
                    <p><strong>${review.user.name}</strong> (Rating: ${review.rating})</p>
                    <p>${review.comment}</p>
                `;
                reviewsList.appendChild(reviewDiv);
            });
        } else {
            console.log('No reviews found.');
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

// Submit a new review
document.getElementById('submit-review-btn').addEventListener('click', async () => {
    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;

    // Assuming the current user's ID is available (you may need to modify based on your authentication system)
    const userId = 1; // Example: Replace with actual user ID

    if (!rating || !comment) {
        alert('Please provide a rating and a comment.');
        return;
    }

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating, comment, productId, userId }),
        });

        const data = await response.json();
        if (data.error) {
            console.error('Error adding review:', data.error);
            alert('Failed to submit review.');
        } else {
            console.log('Review submitted successfully');
            fetchReviews(productId); // Refresh the reviews list after submission
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review.');
    }
});

fetchReviews(productId);
