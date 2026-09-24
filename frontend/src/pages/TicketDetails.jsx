import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /*
    Load ticket whenever ticket ID changes
  */
  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/tickets/${id}`
        );

        setTicket(
          response.data.ticket
        );

      } catch (error) {
        console.error(
          "Failed to load ticket:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to load ticket"
        );

      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id]);


  /*
    Add a comment
  */
  const addComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post(
        `/tickets/${id}/comments`,
        {
          comment: comment.trim()
        }
      );

      setComment("");

      /*
        Reload ticket so the new comment appears
      */
      const response = await api.get(
        `/tickets/${id}`
      );

      setTicket(
        response.data.ticket
      );

    } catch (error) {
      console.error(
        "Failed to add comment:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to add comment"
      );

    } finally {
      setSubmitting(false);
    }
  };


  /*
    Reopen resolved/closed ticket
  */
  const reopenTicket = async () => {
    try {
      setError("");

      await api.patch(
        `/tickets/${id}/reopen`
      );

      /*
        Reload ticket after reopening
      */
      const response = await api.get(
        `/tickets/${id}`
      );

      setTicket(
        response.data.ticket
      );

    } catch (error) {
      console.error(
        "Unable to reopen ticket:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to reopen ticket"
      );
    }
  };


  /*
    Loading screen
  */
  if (loading) {
    return (
      <div className="detail-page">
        <p>Loading ticket...</p>
      </div>
    );
  }


  /*
    Error screen
  */
  if (error && !ticket) {
    return (
      <div className="detail-page">

        <div className="error-message">
          {error}
        </div>

      </div>
    );
  }


  /*
    Ticket not found
  */
  if (!ticket) {
    return (
      <div className="detail-page">
        <p>Ticket not found.</p>
      </div>
    );
  }


  return (
    <div className="detail-page">

      {/* =========================
          ERROR MESSAGE
      ========================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* =========================
          HEADER
      ========================== */}

      <div className="detail-header">

        <div>

          <span>
            {ticket.ticket_no}
          </span>

          <h1>
            {ticket.title}
          </h1>

          <p>
            {ticket.description}
          </p>

        </div>


        <div>

          <span
            className={`status ${ticket.status}`}
          >
            {ticket.status}
          </span>


          <span
            className={`priority ${ticket.priority}`}
          >
            {ticket.priority}
          </span>

        </div>

      </div>


      {/* =========================
          DETAILS GRID
      ========================== */}

      <div className="detail-grid">


        {/* =========================
            TICKET INFORMATION
        ========================== */}

        <section className="detail-card">

          <h2>
            Ticket Information
          </h2>


          <p>
            <strong>
              Category:
            </strong>{" "}

            {ticket.category}
          </p>


          <p>
            <strong>
              Priority:
            </strong>{" "}

            {ticket.priority}
          </p>


          <p>
            <strong>
              Status:
            </strong>{" "}

            {ticket.status}
          </p>


          <p>
            <strong>
              Created:
            </strong>{" "}

            {ticket.created_at
              ? new Date(
                  ticket.created_at
                ).toLocaleString()
              : "Not available"}
          </p>


          <p>
            <strong>
              Last Updated:
            </strong>{" "}

            {ticket.updated_at
              ? new Date(
                  ticket.updated_at
                ).toLocaleString()
              : "Not available"}
          </p>


          <p>
            <strong>
              SLA Due:
            </strong>{" "}

            {ticket.due_at
              ? new Date(
                  ticket.due_at
                ).toLocaleString()
              : "Not set"}
          </p>


          <p>
            <strong>
              Assigned To:
            </strong>{" "}

            {ticket.assigned_staff_name ||
              "Not assigned"}
          </p>


          {/* =========================
              REOPEN BUTTON
          ========================== */}

          {(ticket.status === "resolved" ||
            ticket.status === "closed") && (

            <button
              onClick={reopenTicket}
            >
              Reopen Ticket
            </button>

          )}

        </section>


        {/* =========================
            CONVERSATION
        ========================== */}

        <section className="detail-card">

          <h2>
            Conversation
          </h2>


          {/* COMMENTS */}

          {ticket.comments &&
          ticket.comments.length > 0 ? (

            ticket.comments.map(
              (item) => (

                <div
                  className="comment"
                  key={item.id}
                >

                  <strong>
                    {item.user_name}
                  </strong>


                  <small>
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleString()
                      : ""}
                  </small>


                  <p>
                    {item.comment}
                  </p>

                </div>

              )
            )

          ) : (

            <p>
              No comments yet.
            </p>

          )}


          {/* =========================
              ADD COMMENT
          ========================== */}

          <form
            onSubmit={addComment}
          >

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              placeholder="Add a comment..."
              rows="4"
              disabled={submitting}
            />


            <button
              type="submit"
              disabled={
                submitting ||
                !comment.trim()
              }
            >

              {submitting
                ? "Adding..."
                : "Add Comment"}

            </button>

          </form>

        </section>

      </div>

    </div>
  );
}

export default TicketDetails;