const API_URL = 'https://appointment-0lgh.onrender.com';

async function scheduleAppointment() {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const reason = document.getElementById('reason').value;

    if (!name || !phone || !email || !date || !time || !reason) {
        alert('Please fill in all fields');
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

        alert('Appointment scheduled successfully!');
        document.forms['appointmentForm'].reset();

    } catch (err) {
        console.error('Error:', err);
        alert(err.message || 'Error scheduling appointment. Please try again.');
    }
}

async function checkAppointments() {
    const date = document.getElementById('date').value;
    if (!date) {
        alert('Please select a date to check appointments');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/check-appointments?date=${date}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch appointments');
        }

        if (data.appointments.length === 0) {
            alert('No appointments scheduled for this date');
        } else {
            const appointmentsList = data.appointments
                .map(apt => `${apt.time}: ${apt.summary}`)
                .join('\n');
            alert(`Appointments for ${date}:\n${appointmentsList}`);
        }

    } catch (err) {
        console.error('Error:', err);
        alert('Error checking appointments. Please try again.');
    }
} 
