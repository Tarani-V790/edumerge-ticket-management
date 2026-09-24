import { useEffect, useState } from "react";
import api from "../api";

function StaffDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [tickets, setTickets] = useState([]);

  const [staff, setStaff] = useState([]);

  const [status, setStatus] = useState("");

  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load dashboard statistics
        const dashboardResponse = await api.get(
          "/tickets/dashboard/summary"
        );

        setDashboard(
          dashboardResponse.data.dashboard
        );


        // Load all tickets
        const ticketsResponse = await api.get(
          "/tickets"
        );

        setTickets(
          ticketsResponse.data.tickets
        );


        // Load staff members
        const staffResponse = await api.get(
          "/tickets/users/staff"
        );

        setStaff(
          staffResponse.data.staff
        );

      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Failed to load dashboard data"
        );

      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);


  /*
   * ==========================================
   * LOAD DASHBOARD
   * ==========================================
   */

  const loadDashboard = async () => {
    try {
      const response = await api.get(
        "/tickets/dashboard/summary"
      );

      setDashboard(
        response.data.dashboard
      );

    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );
    }
  };


  /*
   * ==========================================
   * LOAD TICKETS
   * ==========================================
   */

  const loadTickets = async () => {
    try {
      setError("");

      let url = "/tickets?";


      if (status) {
        url += `status=${status}&`;
      }


      if (priority) {
        url += `priority=${priority}`;
      }


      const response = await api.get(url);

      setTickets(
        response.data.tickets
      );

    } catch (error) {
      console.error(
        "Failed to load tickets:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load tickets"
      );
    }
  };


  /*
   * ==========================================
   * ASSIGN TICKET
   * ==========================================
   */

  const assignTicket = async (
    ticketId,
    staffId
  ) => {
    if (!staffId) {
      return;
    }

    try {
      setError("");

      await api.patch(
        `/tickets/${ticketId}/assign`,
        {
          staffId: Number(staffId)
        }
      );


      await loadTickets();

      await loadDashboard();

    } catch (error) {
      console.error(
        "Failed to assign ticket:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to assign ticket"
      );
    }
  };


  /*
   * ==========================================
   * UPDATE STATUS
   * ==========================================
   */

  const updateStatus = async (
    ticketId,
    newStatus
  ) => {
    try {
      setError("");

      await api.patch(
        `/tickets/${ticketId}/status`,
        {
          status: newStatus
        }
      );


      await loadTickets();

      await loadDashboard();

    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to update ticket status"
      );
    }
  };


  /*
   * ==========================================
   * APPLY FILTERS
   * ==========================================
   */

  const applyFilters = async () => {
    await loadTickets();
  };


  /*
   * ==========================================
   * CLEAR FILTERS
   * ==========================================
   */

  const clearFilters = async () => {
    setStatus("");
    setPriority("");

    try {
      setError("");

      const response = await api.get(
        "/tickets"
      );

      setTickets(
        response.data.tickets
      );

    } catch (error) {
      console.error(
        "Failed to clear filters:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load tickets"
      );
    }
  };


  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const handleLogout = () => {
    localStorage.clear();

    window.location.href = "/";
  };


  /*
   * ==========================================
   * LOADING SCREEN
   * ==========================================
   */

  if (loading) {
    return (
      <div className="dashboard">

        <nav>
          <h2>EduSupport</h2>
        </nav>

        <main>

          <h1>
            Support Operations
          </h1>

          <p>
            Loading dashboard...
          </p>

        </main>

      </div>
    );
  }


  /*
   * ==========================================
   * MAIN UI
   * ==========================================
   */

  return (
    <div className="dashboard">


      {/* ======================================
          NAVBAR
      ======================================= */}

      <nav>

        <h2>
          EduSupport
        </h2>

        <button
          onClick={handleLogout}
        >
          Logout
        </button>

      </nav>


      {/* ======================================
          MAIN CONTENT
      ======================================= */}

      <main>

        <h1>
          Support Operations
        </h1>


        {/* ====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* ====================================
            DASHBOARD STATISTICS
        ===================================== */}

        {dashboard && (

          <div className="stats-grid">


            {/* TOTAL */}

            <div className="stat-card">

              <span>
                Total
              </span>

              <strong>
                {dashboard.total}
              </strong>

            </div>


            {/* NEW */}

            <div className="stat-card">

              <span>
                New
              </span>

              <strong>
                {dashboard.new}
              </strong>

            </div>


            {/* ASSIGNED */}

            <div className="stat-card">

              <span>
                Assigned
              </span>

              <strong>
                {dashboard.assigned}
              </strong>

            </div>


            {/* IN PROGRESS */}

            <div className="stat-card">

              <span>
                In Progress
              </span>

              <strong>
                {dashboard.in_progress}
              </strong>

            </div>


            {/* PENDING */}

            <div className="stat-card">

              <span>
                Pending
              </span>

              <strong>
                {dashboard.pending}
              </strong>

            </div>


            {/* RESOLVED */}

            <div className="stat-card">

              <span>
                Resolved
              </span>

              <strong>
                {dashboard.resolved}
              </strong>

            </div>


            {/* CLOSED */}

            <div className="stat-card">

              <span>
                Closed
              </span>

              <strong>
                {dashboard.closed}
              </strong>

            </div>


            {/* OVERDUE */}

            <div className="stat-card overdue">

              <span>
                Overdue
              </span>

              <strong>
                {dashboard.overdue}
              </strong>

            </div>

          </div>

        )}


        {/* ====================================
            FILTERS
        ===================================== */}

        <div className="filters">


          {/* STATUS */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >

            <option value="">
              All Statuses
            </option>

            <option value="new">
              New
            </option>

            <option value="assigned">
              Assigned
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">
              Closed
            </option>

          </select>


          {/* PRIORITY */}

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >

            <option value="">
              All Priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

            <option value="urgent">
              Urgent
            </option>

          </select>


          {/* APPLY */}

          <button
            onClick={applyFilters}
          >
            Apply Filters
          </button>


          {/* CLEAR */}

          <button
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>


        {/* ====================================
            TICKET TABLE
        ===================================== */}

        <div className="ticket-table">

          {tickets.length === 0 ? (

            <p>
              No tickets found.
            </p>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Ticket
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Assigned To
                  </th>

                </tr>

              </thead>


              <tbody>

                {tickets.map(
                  (ticket) => (

                    <tr
                      key={ticket.id}
                    >


                      {/* TICKET */}

                      <td>

                        <strong>
                          {ticket.ticket_no}
                        </strong>

                        <br />

                        {ticket.title}

                      </td>


                      {/* STUDENT */}

                      <td>
                        {ticket.student_name}
                      </td>


                      {/* CATEGORY */}

                      <td>
                        {ticket.category}
                      </td>


                      {/* PRIORITY */}

                      <td>

                        <span
                          className={`priority ${ticket.priority}`}
                        >
                          {ticket.priority}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <select
                          value={
                            ticket.status
                          }
                          onChange={(e) =>
                            updateStatus(
                              ticket.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="new">
                            New
                          </option>

                          <option value="assigned">
                            Assigned
                          </option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="pending">
                            Pending
                          </option>

                          <option value="resolved">
                            Resolved
                          </option>

                          <option value="closed">
                            Closed
                          </option>

                        </select>

                      </td>


                      {/* ASSIGNED STAFF */}

                      <td>

                        <select
                          value={
                            ticket.assigned_to || ""
                          }
                          onChange={(e) =>
                            assignTicket(
                              ticket.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Unassigned
                          </option>


                          {staff.map(
                            (member) => (

                              <option
                                key={member.id}
                                value={member.id}
                              >
                                {member.name}
                              </option>

                            )
                          )}

                        </select>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </main>

    </div>
  );
}

export default StaffDashboard;