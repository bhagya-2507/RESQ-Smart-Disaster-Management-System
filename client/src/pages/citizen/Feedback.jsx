
import { useState } from "react";

const Feedback = ({ citizenId, rescueRequestId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setMessage("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citizen_id: citizenId,
            rescue_request_id: rescueRequestId,
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Feedback submitted successfully!");
        setRating(0);
        setComment("");
      } else {
        setMessage(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-container">
      

      <form onSubmit={handleSubmit}>
        <label>Rate Your Rescue Experience</label>

        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setRating(value)}
              className={rating === value ? "selected" : ""}
            >
              {value} ⭐
            </button>
          ))}
        </div>

        <label>Comments</label>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          maxLength={1000}
          rows={5}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default Feedback;