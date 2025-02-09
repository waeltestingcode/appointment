from flask import Flask, request, jsonify, send_file
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from datetime import datetime
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://appointment-0lgh.onrender.com", "http://localhost:5000"]}})

SCOPES = ['https://www.googleapis.com/auth/calendar']

@app.route('/')
def serve_app():
    return send_file('index.html', mimetype='text/html')

@app.route('/script.js')
def serve_script():
    return send_file('script.js', mimetype='application/javascript')

def get_calendar_service():
    try:
        service_account_info = json.loads(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', '{}'))
        if not service_account_info:
            raise Exception("No credentials found in environment variables")
        
        creds = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=SCOPES)
        
        return build('calendar', 'v3', credentials=creds)
    except Exception as e:
        print(f"Error in get_calendar_service: {str(e)}")
        raise

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

        # Check if timeslot is available
        events_result = service.events().list(
            calendarId='fortnitemobilegamerx@gmail.com',
            timeMin=data['startTime'],
            timeMax=data['endTime'],
            singleEvents=True
        ).execute()
        
        if events_result.get('items', []):
            return jsonify({'error': 'Time slot already booked'}), 409

        event = service.events().insert(
            calendarId='fortnitemobilegamerx@gmail.com',
            body=event
        ).execute()
        return jsonify({'success': True, 'eventId': event['id']})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 
