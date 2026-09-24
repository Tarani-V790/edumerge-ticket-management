import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function StudentDashboard() {

  const [tickets, setTickets] = useState([]);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
  const loadTickets = async () => {
    try {
      const response = await api.get("/tickets");

      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    }
  };

  loadTickets();
}, []);

  const logout = () => {

    localStorage.clear();

    window.location.href = "/";
  };

  return (
    <div className="dashboard">

      <nav>
        <div>
          <h2>EduSupport</h2>
        </div>

        <div>
          <span>
            Hi, {user?.name}
          </span>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main>

        <div className="page-header">

          <div>
            <h1>My Support Tickets</h1>
            <p>
              Track your support requests
            </p>
          </div>

          <Link to="/create-ticket">
            <button>
              + Create Ticket
            </button>
          </Link>

        </div>

        <div className="ticket-grid">

          {tickets.length === 0 ? (

            <div className="empty">
              No tickets yet.
            </div>

          ) : (

            tickets.map((ticket) => (

              <Link
                to={`/tickets/${ticket.id}`}
                className="ticket-card"
                key={ticket.id}
              >

                <div className="ticket-top">

                  <span>
                    {ticket.ticket_no}
                  </span>

                  <span className={`status ${ticket.status}`}>
                    {ticket.status}
                  </span>

                </div>

                <h3>
                  {ticket.title}
                </h3>

                <p>
                  {ticket.description}
                </p>

                <div className="ticket-meta">

                  <span>
                    {ticket.category}
                  </span>

                  <span className={`priority ${ticket.priority}`}>
                    {ticket.priority}
                  </span>

                </div>

              </Link>

            ))

          )}

        </div>

      </main>

    </div>
  );
}

export default StudentDashboard;