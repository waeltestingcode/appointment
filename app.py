from flask import Flask, request, jsonify, send_file
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://appointment-0lgh.onrender.com", "http://localhost:5000"]}})

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/calendar']

@app.route('/')
def serve_app():
    return send_file('index.html')

@app.route('/script.js')
def serve_script():
    return send_file('script.js')

def get_calendar_service():
    creds = service_account.Credentials.from_service_account_file(
        'service-account.json',
        scopes=SCOPES,
        subject='fortnitemobilegamerx@gmail.com')  # Your email
    
    return build('calendar', 'v3', credentials=creds)

@app.route('/schedule-appointment', methods=['POST'])
def schedule_appointment():
    try:
        data = request.json
        service = get_calendar_service()
        
        event = {
            'summary': f"Appointment with {data['name']}",
            'description': f"Reason: {data['reason']}\nPhone: {data['phone']}\nEmail: {data['email']}",
            'start': {
                'dateTime': data['startTime'],
                'timeZone': 'Asia/Dubai',
            },
            'end': {
                'dateTime': data['endTime'],
                'timeZone': 'Asia/Dubai',
            },
        }

        events_result = service.events().list(
            calendarId='primary',
            timeMin=data['startTime'],
            timeMax=data['endTime'],
            singleEvents=True
        ).execute()
        events = events_result.get('items', [])

        if events:
            return jsonify({'error': 'Time slot already booked'}), 409

        event = service.events().insert(
            calendarId='fortnitemobilegamerx@gmail.com',  # Your actual calendar ID
            body=event
        ).execute()
        return jsonify({'success': True, 'eventId': event['id']})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-appointments')
def check_appointments():
    try:
        date = request.args.get('date')
        if not date:
            return jsonify({'error': 'Date is required'}), 400

        # Create time bounds for the day
        start_time = f"{date}T00:00:00Z"
        end_time = f"{date}T23:59:59Z"

        service = get_calendar_service()
        events_result = service.events().list(
            calendarId='fortnitemobilegamerx@gmail.com',  # Your actual calendar ID
            timeMin=start_time,
            timeMax=end_time,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        appointments = []
        
        for event in events:
            start = event['start'].get('dateTime')
            if start:
                time = datetime.fromisoformat(start.replace('Z', '+00:00')).strftime('%I:%M %p')
                appointments.append({
                    'time': time,
                    'summary': event['summary']
                })

        return jsonify({
            'success': True,
            'appointments': appointments
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 
