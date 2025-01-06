const API_URL = 'https://appointment-0lgh.onrender.com';

// Create floating particles
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 5 and 15 pixels
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // Random animation duration between 10 and 20 seconds
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        
        container.appendChild(particle);
        
        // Remove and recreate particle when animation ends
        particle.addEventListener('animationend', () => {
            particle.remove();
            createParticle();
        });
    }
}

function createParticle() {
    const container = document.getElementById('particles');
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = '100vh';
    
    particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
    
    container.appendChild(particle);
    
    particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle();
    });
}

// Initialize particles when page loads
document.addEventListener('DOMContentLoaded', createParticles);

// Set minimum date to today when page loads
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
});

function showMessage(text, type = 'processing') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = type;  // 'processing', 'success', or 'error'
    messageDiv.style.display = 'block';
    
    // Only auto-hide success and error messages
    if (type !== 'processing') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

async function scheduleAppointment() {
    event.preventDefault();

    const submitButton = event.target;
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    showMessage('Scheduling your appointment...', 'processing');

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
        // Schedule appointment
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

        // Send confirmation email
        try {
            await emailjs.send(
                "service_kobz9f7",
                "template_05b1tgq",
                {
                    to_email: email,
                    to_name: name,
                    appointment_date: new Date(startDateTime).toLocaleDateString(),
                    appointment_time: time,
                    appointment_reason: reason,
                    reply_to: "fortnitemobilegamerx@gmail.com"
                }
            );
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        showMessage('Appointment scheduled successfully!', 'success');
        document.forms['appointmentForm'].reset();

    } catch (err) {
        console.error('Error:', err);
        showMessage(err.message || 'Error scheduling appointment. Please try again.', 'error');
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Schedule Appointment';
    }
} 
