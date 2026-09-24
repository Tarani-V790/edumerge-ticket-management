import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CreateTicket() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "fees",
    priority: "medium"
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response =
        await api.post("/tickets", form);

      navigate(
        `/tickets/${response.data.ticket.id}`
      );

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Failed to create ticket"
      );

    }
  };

  return (
    <div className="form-page">

      <div className="form-card">

        <h1>Create Support Ticket</h1>

        <p>
          Tell us what you need help with.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Title</label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: Unable to download fee receipt"
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your issue..."
            rows="6"
            required
          />

          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="fees">Fees</option>
            <option value="attendance">Attendance</option>
            <option value="id_card">ID Card</option>
            <option value="documents">Documents</option>
            <option value="certificates">Certificates</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>

          <label>Priority</label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button type="submit">
            Submit Ticket
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateTicket;