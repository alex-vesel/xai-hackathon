from flask import Flask, request
from flask_cors import CORS
import requests
from flask import jsonify
import json
import light_pollution as lp
from dotenv import load_dotenv
import openai
import os
app = Flask(__name__)
# pip install python-dotenv

CORS(app) 
dir = os.path.dirname(__file__)
load_dotenv(dotenv_path=os.path.join(dir, '../secrets.env'))

#make the route a get request with latitude and longitude as parameters

@app.route('/data')
def get_data():
    latitude = float(request.args.get('latitude'))
    longitude = float(request.args.get('longitude'))
    print(latitude, longitude)

    light_value = light(latitude, longitude)
    weather_dict = get_weather(latitude, longitude)
    weather_dict["light"] = light_value

    return jsonify(weather_dict)

def light(latitude, longitude):
    print('latitude:', latitude, 'longitude:', longitude)
    pixel_coordinates = lp.geo_to_pixel(longitude, latitude)
    pixel_value = lp.band_data[pixel_coordinates[1], pixel_coordinates[0]]
    return str(pixel_value)

WEATHER_API_KEY = os.environ['WEATHER_API_KEY']

def get_weather(latitude,longitude):

    url = f'https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={WEATHER_API_KEY}&units=metric'
    
    # Make the request to the OpenWeatherMap API
    response = requests.get(url)
    
    # Check if the request was successful
    weather_data = response.json()
    return weather_data
    


@app.route('/chat')
def chat():
    input_text = request.args.get('input')
    openai.api_key = os.environ['OPENAI_API_KEY']
    try:
        response = openai.chat.completions.create(
            model="gpt-4",  # Updated to use GPT-4 model
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": input_text}
            ]
        )
        chatbot_response = response.choices[0].message.content
    except Exception as e:
        chatbot_response = f"An error occurred: {str(e)}"
    return jsonify({'response': chatbot_response})

if __name__ == '__main__':
    app.run()
