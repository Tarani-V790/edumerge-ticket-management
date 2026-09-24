import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE TICKET
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority
    } = req.body;

    // Basic validation
    if (!title || !description || !category || !priority) {
      return res.status(400).json({
        message: "Title, description, category and priority are required"
      });
    }

    // Allowed priorities
    const validPriorities = [
      "low",
      "medium",
      "high",
      "urgent"
    ];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }
    // Calculate due date based on priority
    const slaHours = {
  low: 48,
  medium: 24,
  high: 8,
  urgent: 2
};



const dueAt = new Date(
  Date.now() + slaHours[priority] * 60 * 60 * 1000
);

    // Only students can create tickets
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can create tickets"
      });
    }

    // Create ticket
    const result = await pool.query(
      `INSERT INTO tickets
       (ticket_no, title, description, category, priority,
        status, student_id ,due_at)
       VALUES
       ('TKT-' || nextval('tickets_id_seq'),
        $1, $2, $3, $4, 'new', $5,$6)
       RETURNING *`,
      [
        title,
        description,
        category,
        priority,
        req.user.id,
         dueAt
      ]
    );

    const ticket = result.rows[0];

    // Add activity history
    await pool.query(
      `INSERT INTO ticket_activity
       (ticket_id, actor_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        ticket.id,
        req.user.id,
        "ticket_created",
        "Ticket created by student"
      ]
    );

    res.status(201).json({
      message: "Ticket created successfully",
      ticket
    });

  } catch (error) {
    console.error("Create ticket error:", error);

    res.status(500).json({
      message: "Server error while creating ticket"
    });
  }
});
// GET TICKETS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = `
      SELECT
        t.*,
        u.name AS student_name,
        s.name AS assigned_staff_name
      FROM tickets t
      JOIN users u ON t.student_id = u.id
      LEFT JOIN users s ON t.assigned_to = s.id
    `;

    const conditions = [];
    const values = [];

    // Student sees only their own tickets
    if (req.user.role === "student") {
      values.push(req.user.id);
      conditions.push(`t.student_id = $${values.length}`);
    }

    // Optional status filter
    if (status) {
      values.push(status);
      conditions.push(`t.status = $${values.length}`);
    }

    // Optional priority filter
    if (priority) {
      values.push(priority);
      conditions.push(`t.priority = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, values);

    res.json({
      tickets: result.rows
    });

  } catch (error) {
    console.error("Get tickets error:", error);

    res.status(500).json({
      message: "Server error while fetching tickets"
    });
  }
});
// ASSIGN TICKET
router.patch("/:id/assign", authMiddleware, async (req, res) => {
  try {
    const { staffId } = req.body;
    const ticketId = req.params.id;

    // Only staff or manager can assign tickets
    if (
      req.user.role !== "staff" &&
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        message: "Only staff or manager can assign tickets"
      });
    }

    if (!staffId) {
      return res.status(400).json({
        message: "staffId is required"
      });
    }

    // Check that the staff user exists
    const staffResult = await pool.query(
      `SELECT id, name, role
       FROM users
       WHERE id = $1`,
      [staffId]
    );

    if (staffResult.rows.length === 0) {
      return res.status(404).json({
        message: "Staff user not found"
      });
    }

    if (staffResult.rows[0].role !== "staff") {
      return res.status(400).json({
        message: "Selected user is not a staff member"
      });
    }

    // Check ticket exists
    const ticketResult = await pool.query(
      `SELECT *
       FROM tickets
       WHERE id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    // Assign ticket
    const result = await pool.query(
      `UPDATE tickets
       SET assigned_to = $1,
           status = 'assigned',
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [staffId, ticketId]
    );

    const ticket = result.rows[0];

    // Add activity history
    await pool.query(
      `INSERT INTO ticket_activity
       (ticket_id, actor_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        ticketId,
        req.user.id,
        "ticket_assigned",
        `Ticket assigned to staff ID ${staffId}`
      ]
    );

    res.json({
      message: "Ticket assigned successfully",
      ticket
    });

  } catch (error) {
    console.error("Assign ticket error:", error);

    res.status(500).json({
      message: "Server error while assigning ticket"
    });
  }
});
// UPDATE TICKET STATUS
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    const validStatuses = [
      "new",
      "assigned",
      "in_progress",
      "pending",
      "resolved",
      "closed"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid ticket status"
      });
    }

    // Only staff and managers can update ticket status
    if (
      req.user.role !== "staff" &&
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        message: "Only staff or manager can update ticket status"
      });
    }

    // Check ticket exists
    const ticketResult = await pool.query(
      `SELECT *
       FROM tickets
       WHERE id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const oldStatus = ticketResult.rows[0].status;

    // Update status
    const result = await pool.query(
      `UPDATE tickets
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, ticketId]
    );

    const ticket = result.rows[0];

    // Record activity
    await pool.query(
      `INSERT INTO ticket_activity
       (ticket_id, actor_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        ticketId,
        req.user.id,
        "status_changed",
        `Status changed from ${oldStatus} to ${status}`
      ]
    );

    res.json({
      message: "Ticket status updated successfully",
      ticket
    });

  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      message: "Server error while updating ticket status"
    });
  }
});
// ADD COMMENT TO TICKET
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment is required"
      });
    }

    // Check ticket exists
    const ticketResult = await pool.query(
      `SELECT *
       FROM tickets
       WHERE id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket = ticketResult.rows[0];

    // Student can comment only on their own ticket
    if (
      req.user.role === "student" &&
      ticket.student_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only comment on your own tickets"
      });
    }

    // Staff/manager can comment on tickets
    if (
      req.user.role !== "student" &&
      req.user.role !== "staff" &&
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        message: "You do not have permission to comment"
      });
    }

    // Create comment
    const result = await pool.query(
      `INSERT INTO ticket_comments
       (ticket_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        ticketId,
        req.user.id,
        comment.trim()
      ]
    );

    const newComment = result.rows[0];

    // Add activity
    await pool.query(
      `INSERT INTO ticket_activity
       (ticket_id, actor_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        ticketId,
        req.user.id,
        "comment_added",
        "Comment added to ticket"
      ]
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment
    });

  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Server error while adding comment"
    });
  }
});
// GET SINGLE TICKET WITH COMMENTS AND ACTIVITY
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticketResult = await pool.query(
      `SELECT
        t.*,
        u.name AS student_name,
        u.email AS student_email,
        s.name AS assigned_staff_name
       FROM tickets t
       JOIN users u ON t.student_id = u.id
       LEFT JOIN users s ON t.assigned_to = s.id
       WHERE t.id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket = ticketResult.rows[0];

    // Student can only view own ticket
    if (
      req.user.role === "student" &&
      ticket.student_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only view your own tickets"
      });
    }

    const commentsResult = await pool.query(
      `SELECT
        c.*,
        u.name AS user_name,
        u.role
       FROM ticket_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = $1
       ORDER BY c.created_at ASC`,
      [ticketId]
    );

    const activityResult = await pool.query(
      `SELECT
        a.*,
        u.name AS actor_name
       FROM ticket_activity a
       JOIN users u ON a.actor_id = u.id
       WHERE a.ticket_id = $1
       ORDER BY a.created_at ASC`,
      [ticketId]
    );

    res.json({
      ticket,
      comments: commentsResult.rows,
      activity: activityResult.rows
    });

  } catch (error) {
    console.error("Get ticket error:", error);

    res.status(500).json({
      message: "Server error while fetching ticket"
    });
  }
});
// GET TICKET COMMENTS
router.get("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const result = await pool.query(
      `SELECT
        c.*,
        u.name AS user_name,
        u.role
       FROM ticket_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = $1
       ORDER BY c.created_at ASC`,
      [ticketId]
    );

    res.json({
      comments: result.rows
    });

  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error while fetching comments"
    });
  }
});
// GET TICKET ACTIVITY
router.get("/:id/activity", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const result = await pool.query(
      `SELECT
        a.*,
        u.name AS actor_name,
        u.role
       FROM ticket_activity a
       JOIN users u ON a.actor_id = u.id
       WHERE a.ticket_id = $1
       ORDER BY a.created_at ASC`,
      [ticketId]
    );

    res.json({
      activity: result.rows
    });

  } catch (error) {
    console.error("Get activity error:", error);

    res.status(500).json({
      message: "Server error while fetching activity"
    });
  }
});
// DASHBOARD SUMMARY
router.get("/dashboard/summary", authMiddleware, async (req, res) => {
  try {
    // Only staff and manager can access dashboard
    if (
      req.user.role !== "staff" &&
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        message: "Only staff or manager can view dashboard"
      });
    }

    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,

        COUNT(*) FILTER (
          WHERE status = 'new'
        ) AS new,

        COUNT(*) FILTER (
          WHERE status = 'assigned'
        ) AS assigned,

        COUNT(*) FILTER (
          WHERE status = 'in_progress'
        ) AS in_progress,

        COUNT(*) FILTER (
          WHERE status = 'pending'
        ) AS pending,

        COUNT(*) FILTER (
          WHERE status = 'resolved'
        ) AS resolved,

        COUNT(*) FILTER (
          WHERE status = 'closed'
        ) AS closed,

        COUNT(*) FILTER (
          WHERE due_at IS NOT NULL
          AND due_at < NOW()
          AND status NOT IN ('resolved', 'closed')
        ) AS overdue

      FROM tickets
    `);

    res.json({
      dashboard: result.rows[0]
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Server error while loading dashboard"
    });
  }
});
// GET STAFF USERS
router.get("/users/staff", authMiddleware, async (req, res) => {
  try {
    if (
      req.user.role !== "staff" &&
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        message: "Only staff or manager can view staff list"
      });
    }

    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE role = 'staff'
       ORDER BY name ASC`
    );

    res.json({
      staff: result.rows
    });

  } catch (error) {
    console.error("Get staff error:", error);

    res.status(500).json({
      message: "Server error while fetching staff"
    });
  }
});
// REOPEN TICKET
router.patch("/:id/reopen", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const result = await pool.query(
      `SELECT *
       FROM tickets
       WHERE id = $1`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const ticket = result.rows[0];

    if (
      req.user.role === "student" &&
      ticket.student_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only reopen your own tickets"
      });
    }

    if (
      ticket.status !== "resolved" &&
      ticket.status !== "closed"
    ) {
      return res.status(400).json({
        message: "Only resolved or closed tickets can be reopened"
      });
    }

    const updated = await pool.query(
      `UPDATE tickets
       SET status = 'in_progress',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [ticketId]
    );

    await pool.query(
      `INSERT INTO ticket_activity
       (ticket_id, actor_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        ticketId,
        req.user.id,
        "ticket_reopened",
        "Ticket reopened by student"
      ]
    );

    res.json({
      message: "Ticket reopened successfully",
      ticket: updated.rows[0]
    });

  } catch (error) {
    console.error("Reopen ticket error:", error);

    res.status(500).json({
      message: "Server error while reopening ticket"
    });
  }
});

export default router;