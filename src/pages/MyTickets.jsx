
import { useEffect, useState } from "react";
import "./MyTickets.css";

const API_URL = "http://13.201.100.65:8080/api/bookings";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const customer = JSON.parse(
    localStorage.getItem("skybookerCustomer") || "null"
  );

  const customerId = customer?.customerId ?? customer?.id;

  async function loadTickets() {
    if (!customerId) {
      setError("Please log in to view your bookings.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/customer/${customerId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load your bookings.");
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load tickets. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [customerId]);

  async function cancelTicket(ticket) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${ticket.bookingId} (PNR: ${ticket.pnrNumber})?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(ticket.bookingId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${ticket.bookingId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "text/plain, application/json",
          },
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result || "Unable to cancel this ticket.");
      }

      setMessage(result || "Booking cancelled successfully.");

      // Reload bookings so the latest status comes from the database.
      await loadTickets();
    } catch (err) {
      setError(err.message || "Unable to cancel this ticket.");
    } finally {
      setCancellingId(null);
    }
  }

  function formatDate(value) {
    if (!value) return "Not available";

    // Handles both ISO date strings and the date-array format
    // sometimes returned by Spring Boot.
    if (Array.isArray(value)) {
      const [year, month, day] = value;
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="my-tickets-page">
        <p className="tickets-info">Loading your bookings...</p>
      </main>
    );
  }

  return (
    <main className="my-tickets-page">
      <section className="tickets-heading">
        <p className="tickets-eyebrow">YOUR JOURNEYS</p>
        <h1>My Bookings</h1>
        <p>View your tickets and manage your flight bookings.</p>
      </section>

      {message && (
        <div className="tickets-message success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="tickets-message error-message">
          {error}
          {!customerId && (
            <p>Please log in using your SkyBooker account.</p>
          )}
        </div>
      )}

      {!error && tickets.length === 0 && (
        <section className="empty-tickets">
          <div className="empty-ticket-icon">✈</div>
          <h2>No bookings found</h2>
          <p>Your booked flights will appear here.</p>
        </section>
      )}

      <section className="tickets-list">
        {tickets.map((ticket) => {
          const cancelled =
            ticket.bookingStatus?.toUpperCase() === "CANCELLED";

          return (
            <article className="booking-card" key={ticket.bookingId}>
              <div className="booking-card-top">
                <div>
                  <span className="booking-label">BOOKING ID</span>
                  <h2>#{ticket.bookingId}</h2>
                </div>

                <span
                  className={`booking-status ${
                    cancelled
                      ? "status-cancelled"
                      : ticket.bookingStatus?.toUpperCase() === "CONFIRMED"
                      ? "status-confirmed"
                      : "status-pending"
                  }`}
                >
                  {ticket.bookingStatus}
                </span>
              </div>

              <div className="booking-route">
                <div>
                  <span className="booking-label">FLIGHT</span>
                  <h3>{ticket.flightNumber || "Flight details"}</h3>
                  <p>
                    {ticket.numberOfPassengers} passenger
                    {ticket.numberOfPassengers === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="route-plane" aria-hidden="true">
                  <span />
                  ✈
                  <span />
                </div>

                <div className="booking-price">
                  <span className="booking-label">TOTAL AMOUNT</span>
                  <h3>
                    ₹
                    {Number(ticket.totalAmount || 0).toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 2 }
                    )}
                  </h3>
                  <p>{formatDate(ticket.bookingDate)}</p>
                </div>
              </div>

              <div className="booking-meta">
                <div>
                  <span className="booking-label">PNR NUMBER</span>
                  <strong>{ticket.pnrNumber || "Not available"}</strong>
                </div>

                <div>
                  <span className="booking-label">PASSENGER</span>
                  <strong>{ticket.customerName || "Customer"}</strong>
                </div>
              </div>

              {selectedTicket === ticket.bookingId && (
                <div className="ticket-details">
                  <h3>Ticket Details</h3>
                  <p>
                    <strong>Booking ID:</strong> {ticket.bookingId}
                  </p>
                  <p>
                    <strong>PNR:</strong> {ticket.pnrNumber}
                  </p>
                  <p>
                    <strong>Flight:</strong> {ticket.flightNumber}
                  </p>
                  <p>
                    <strong>Passengers:</strong>{" "}
                    {ticket.numberOfPassengers}
                  </p>
                  <p>
                    <strong>Booking date:</strong>{" "}
                    {formatDate(ticket.bookingDate)}
                  </p>
                  <p>
                    <strong>Status:</strong> {ticket.bookingStatus}
                  </p>
                </div>
              )}

              <div className="booking-actions">
                <button
                  type="button"
                  className="view-ticket-button"
                  onClick={() =>
                    setSelectedTicket(
                      selectedTicket === ticket.bookingId
                        ? null
                        : ticket.bookingId
                    )
                  }
                >
                  {selectedTicket === ticket.bookingId
                    ? "Hide Ticket"
                    : "View Ticket"}
                </button>

                {!cancelled && (
                  <button
                    type="button"
                    className="cancel-ticket-button"
                    disabled={cancellingId === ticket.bookingId}
                    onClick={() => cancelTicket(ticket)}
                  >
                    {cancellingId === ticket.bookingId
                      ? "Cancelling..."
                      : "Cancel Ticket"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default MyTickets;
