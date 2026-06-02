import os
import requests
from datetime import timedelta
from django.shortcuts import render, redirect
from django.utils import timezone
from .models import FavoriteCity, WeatherData


#  Use your REAL API key here (32 characters)
API_KEY = "71cafe246b7f90f0b03acb621f13e6a6"


#  Home Page
def home(request):
    city = request.GET.get('city')
    context = {}

    if not city:
        return render(request, 'home.html', context)

    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": API_KEY,
            "units": "metric"
        }

        response = requests.get(url, params=params, timeout=5)
        data = response.json()

        if data.get("cod") == 200:
            context = {
                'city': city.title(),
                'temp': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'weather': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon'],
                'wind': data['wind']['speed'],
            }
        else:
            context = {'error': f"{city} not found"}

    except requests.exceptions.RequestException:
        context = {'error': "⚠️ Unable to fetch data. Check internet/API key."}

    return render(request, 'home.html', context)


def forecast(request):
    city = request.GET.get("city", "").strip()
    forecast_data = []

    if city:
        try:
            url = "https://api.openweathermap.org/data/2.5/forecast"
            params = {
                "q": city,
                "appid": API_KEY,
                "units": "metric"
            }

            response = requests.get(url, params=params, timeout=5)
            data = response.json()

            if data.get("cod") == "200":
                for item in data["list"][::8]:
                    forecast_data.append({
                        "date": item["dt_txt"],
                        "temp": item["main"]["temp"],
                        "weather": item["weather"][0]["description"],
                        "icon": item["weather"][0]["icon"],
                        "humidity": item["main"]["humidity"],
                        "wind_speed": item["wind"]["speed"],
                    })

        except requests.exceptions.RequestException:
            forecast_data = []

    return render(request, "forecast.html", {
        "forecast_data": forecast_data,
        "city": city
    })


#  Favorites Page
def favorites(request):
    # ➕ Add city
    if request.method == "POST":
        city = request.POST.get("city", "").strip()

        if city and not FavoriteCity.objects.filter(city_name__iexact=city).exists():
            FavoriteCity.objects.create(city_name=city)

        return redirect("favorites")

    cities = FavoriteCity.objects.all()
    weather_list = []

    for city_obj in cities:
        city = city_obj.city_name

        try:
            #  Check cache (10 min)
            weather = WeatherData.objects.filter(city=city).first()

            if weather and timezone.now() - weather.timestamp < timedelta(minutes=10):
                weather_list.append(weather)
                continue

            #  API call
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "q": city,
                "appid": API_KEY,
                "units": "metric"
            }

            response = requests.get(url, params=params, timeout=5)
            data = response.json()

            if data.get("cod") == 200:
                # 🗑 delete old cache
                WeatherData.objects.filter(city=city).delete()

                #  save new
                weather = WeatherData.objects.create(
                    city=city,
                    temperature=data["main"]["temp"],
                    humidity=data["main"]["humidity"],
                    weather_description=data["weather"][0]["description"],
                    icon=data["weather"][0]["icon"],
                    wind_speed=data["wind"]["speed"],
                )
                weather_list.append(weather)

        except requests.exceptions.RequestException:
            continue

    return render(request, "favorites.html", {
        "favorites": [c.city_name for c in cities],
        "weather_data": weather_list,
    })


#  Remove Favorite (FIXED)
def remove_favorite(request, city):
    FavoriteCity.objects.filter(city_name=city).delete()
    return redirect('favorites')


#  Compare Cities
def compare(request):
    city1 = request.GET.get('city1')
    city2 = request.GET.get('city2')

    result = {}

    def get_weather(city):
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "q": city,
                "appid": API_KEY,
                "units": "metric"
            }
            return requests.get(url, params=params, timeout=5).json()
        except:
            return None

    if city1 and city2:
        data1 = get_weather(city1)
        data2 = get_weather(city2)

        if data1 and data2 and data1.get("cod") == 200 and data2.get("cod") == 200:
            result = {
                'city1': {
                    'name': city1,
                    'temp': data1['main']['temp'],
                    'weather': data1['weather'][0]['description']
                },
                'city2': {
                    'name': city2,
                    'temp': data2['main']['temp'],
                    'weather': data2['weather'][0]['description']
                }
            }

    return render(request, 'compare.html', {'result': result})


#  Alerts Page
def alerts(request):
    alerts_data = [
        "Heavy Rain Warning",
        "High Temperature Alert",
        "Cyclone Warning"
    ]

    return render(request, 'alerts.html', {
        'alerts': alerts_data
    })


#  Settings Page
def settings(request):
    return render(request, 'settings.html')