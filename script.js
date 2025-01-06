const API_URL = 'https://appointment-0lgh.onrender.com';

function showMessage(text, isError = false) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = isError ? 'error' : 'success';
    messageDiv.style.display = 'block';
    
    // Optionally hide the message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

async function scheduleAppointment() {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const reason = document.getElementById('reason').value;

    if (!name || !phone || !email || !date || !time || !reason) {
        showMessage('Please fill in all fields', true);
        return;
    }

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    try {
        const response = await fetch(`${API_URL}/schedule-appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                phone,
                email,
                reason,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString()
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to schedule appointment');
        }

        showMessage('Appointment scheduled successfully!');
        document.forms['appointmentForm'].reset();

    } catch (err) {
        console.error('Error:', err);
        showMessage(err.message || 'Error scheduling appointment. Please try again.', true);
    }
} 
