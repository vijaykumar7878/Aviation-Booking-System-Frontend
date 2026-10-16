import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Booking.css';

const API_URL = 'https://sleeve-highway-significance-forum.trycloudflare.com/api/bookings';

async function readResponse(response) {
const text = await response.text();

if (!text) {
throw new Error(`Server returned an empty response (HTTP ${response.status}).`);
}

try {
return JSON.parse(text);
} catch {
// The backend may return plain text for OTP verification and resend.
return { message: text };
}
}

function Booking() {
const location = useLocation();
const navigate = useNavigate();

const flight = location.state?.flight;
const passengers = Number(location.state?.passengers) || 1;

const [customer] = useState(() => {
try {
return JSON.parse(localStorage.getItem('skybookerCustomer'));
} catch {
return null;
}
});

const [bookingId, setBookingId] = useState(null);
const [otp, setOtp] = useState('');
const [step, setStep] = useState('review');
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [bookingDetails, setBookingDetails] = useState(null);

const customerId = customer?.id;
const flightId = flight?.flightId ?? flight?.id;

const startBooking = async () => {
console.log('Continue & Send OTP button clicked');
if (loading) return;


setError('');
setMessage('');

if (!customerId) {
  navigate('/login', {
    state: { from: '/booking', flight, passengers },
  });
  return;
}

if (!flight || flightId == null) {
  setError('Please select a flight before booking.');
  return;
}

setLoading(true);
console.log('Sending booking request to:', API_URL);

try {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: Number(customerId),
      flightId: Number(flightId),
      numberOfPassengers: passengers,
    }),
  });

  const data = await readResponse(response);
  console.log('Booking API status:', response.status);
  console.log('Booking API response:', data);

  if (!response.ok) {
    throw new Error(data.message || 'Could not create booking.');
  }

  if (!data.bookingId) {
    throw new Error(
      data.message ||
      'The server did not return a booking ID. Check BookingController and restart Spring Boot.'
    );
  }

  if (data.message !== 'OTP sent to your email') {
    throw new Error(data.message || 'Could not send OTP.');
  }

  setBookingId(data.bookingId);
  setMessage(data.message);
  setStep('otp');
} catch (err) {
  setError(err.message || 'Unable to connect to the server.');
} finally {
  setLoading(false);
}


};

const verifyOtp = async (event) => {
event.preventDefault();


if (loading) return;

setError('');
setMessage('');

if (!/^\d{6}$/.test(otp)) {
  setError('Enter the 6-digit OTP sent to your email.');
  return;
}

setLoading(true);

try {
  const params = new URLSearchParams({
    bookingId: String(bookingId),
    enteredOtp: otp,
  });
  console.log('Starting fetch request...');
  const response = await fetch(
    `${API_URL}/verify-otp?${params.toString()}`,
    { method: 'POST' }
  );

  const result = await readResponse(response);
  const resultMessage = result.message || '';

  if (!response.ok) {
    throw new Error(resultMessage || 'OTP verification failed.');
  }

  if (resultMessage.trim() !== 'Booking confirmed successfully') {
    throw new Error(resultMessage || 'OTP verification failed.');
  }

  const detailsResponse = await fetch(`${API_URL}/${bookingId}`);
  let details = null;

  if (detailsResponse.ok) {
    details = await readResponse(detailsResponse);
    setBookingDetails(details);
  }

  setMessage('Booking confirmed successfully');
  setStep('success');
} catch (err) {
  setError(err.message || 'Unable to verify OTP.');
} finally {
  setLoading(false);
}


};

const resendOtp = async () => {
if (loading) return;


setError('');
setMessage('');
setLoading(true);

try {
  const response = await fetch(
    `${API_URL}/resend-otp/${bookingId}`,
    { method: 'POST' }
  );

  const result = await readResponse(response);
  const resultMessage = (result.message || '').trim();

  if (!response.ok ||
      resultMessage !== 'New OTP sent to your email') {
    throw new Error(resultMessage || 'Could not resend OTP.');
  }

  setOtp('');
  setMessage(resultMessage);
} catch (err) {
  setError(err.message || 'Unable to resend OTP.');
} finally {
  setLoading(false);
}


};

if (!customerId) {
return ( <main className="booking-page"> <section className="booking-card"> <h1>Login Required</h1> <p>Please log in before booking your flight.</p>
<button onClick={() => navigate('/login')}>
Go to Login </button> </section> </main>
);
}

if (!flight || flightId == null) {
return ( <main className="booking-page"> <section className="booking-card"> <h1>No Flight Selected</h1> <p>Please select a flight first.</p>
<button onClick={() => navigate('/search-flights')}>
Search Flights </button> </section> </main>
);
}

return ( <main className="booking-page"> <section className="booking-card"> <p className="booking-eyebrow">SKYBOOKER</p>


    {step === 'review' && (
      <>
        <h1>Review Your Booking</h1>
        <p className="booking-subtitle">
          Check your details before continuing.
        </p>

        <div className="booking-section">
          <h2>Customer Details</h2>
          <p><strong>Name:</strong> {customer.name || 'Customer'}</p>
          <p><strong>Email:</strong> {customer.email || 'Not available'}</p>
          <p><strong>Customer ID:</strong> {customerId}</p>
        </div>

        <div className="booking-section">
          <h2>Selected Flight</h2>
          <p><strong>Flight ID:</strong> {flightId}</p>
          <p>
            <strong>Flight Number:</strong>{' '}
            {flight.flightNumber || 'Not available'}
          </p>
          <p>
            <strong>From:</strong>{' '}
            {flight.source || flight.origin || 'Not available'}
          </p>
          <p>
            <strong>To:</strong>{' '}
            {flight.destination ||
              flight.destinationAirport ||
              'Not available'}
          </p>
          <p><strong>Passengers:</strong> {passengers}</p>
          {flight.price != null && (
            <p>
              <strong>Price per passenger:</strong> ₹{flight.price}
            </p>
          )}
        </div>

        <button
          className="booking-submit"
          onClick={startBooking}
          disabled={loading}
        >
          {loading ? 'Sending OTP...' : 'Continue & Send OTP'}
        </button>
      </>
    )}

    {step === 'otp' && (
      <>
        <h1>Verify Your Email</h1>
        <p className="booking-subtitle">
          Enter the 6-digit OTP sent to {customer.email}.
        </p>

        <form onSubmit={verifyOtp}>
          <label htmlFor="booking-otp">One-Time Password</label>
          <input
            id="booking-otp"
            className="booking-otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            required
          />

          <button
            className="booking-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          className="booking-secondary"
          type="button"
          onClick={resendOtp}
          disabled={loading}
        >
          Resend OTP
        </button>

        <p className="booking-hint">
          Your OTP expires after 5 minutes. Check your inbox and spam folder.
        </p>
      </>
    )}

    {step === 'success' && (
      <>
        <div className="booking-success-icon">✓</div>
        <h1>Booking Confirmed!</h1>
        <p className="booking-subtitle">
          Your OTP was verified successfully.
        </p>

        <div className="booking-section">
          <h2>Booking Details</h2>
          <p>
            <strong>Booking ID:</strong>{' '}
            {bookingDetails?.bookingId ?? bookingId}
          </p>
          <p>
            <strong>PNR:</strong>{' '}
            {bookingDetails?.pnrNumber || 'Not available'}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            {bookingDetails?.bookingStatus || 'CONFIRMED'}
          </p>
          <p>
            <strong>Flight:</strong>{' '}
            {bookingDetails?.flightNumber || flight.flightNumber || 'N/A'}
          </p>
          <p>
            <strong>Passengers:</strong>{' '}
            {bookingDetails?.numberOfPassengers ?? passengers}
          </p>
          {bookingDetails?.totalAmount != null && (
            <p>
              <strong>Total Amount:</strong> ₹{bookingDetails.totalAmount}
            </p>
          )}
        </div>

        <button
          className="booking-submit"
          onClick={() => navigate('/search-flights')}
        >
          Back to Flights
        </button>
      </>
    )}

    {message && (
      <p className="booking-message" role="status">{message}</p>
    )}

    {error && (
      <p className="booking-error" role="alert">{error}</p>
    )}
  </section>
</main>


);
}

export default Booking;
