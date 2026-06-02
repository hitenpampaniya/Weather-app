from django.db import models


#  Favorite Cities (User can save cities)
class FavoriteCity(models.Model):
    city_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.city_name


#  Weather Cache (optional - API calls reduce karne ke liye)
class WeatherData(models.Model):
    city = models.CharField(max_length=100)
    temperature = models.FloatField()
    humidity = models.IntegerField()
    weather_description = models.CharField(max_length=255)
    icon = models.CharField(max_length=10)
    wind_speed = models.FloatField()
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.city} - {self.temperature}°C"


# Forecast Data (store future weather)
class Forecast(models.Model):
    city = models.CharField(max_length=100)
    date = models.DateTimeField()
    temperature = models.FloatField()
    weather_description = models.CharField(max_length=255)
    icon = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.city} - {self.date}"


#  Weather Alerts
class WeatherAlert(models.Model):
    city = models.CharField(max_length=100)
    alert_type = models.CharField(max_length=100)
    message = models.TextField()
    severity = models.CharField(
        max_length=50,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.city} - {self.alert_type}"


#  User Settings
class UserSettings(models.Model):
    city_default = models.CharField(max_length=100, default="Porbandar")
    temperature_unit = models.CharField(
        max_length=10,
        choices=[
            ('celsius', 'Celsius'),
            ('fahrenheit', 'Fahrenheit')
        ],
        default='celsius'
    )
    dark_mode = models.BooleanField(default=True)

    def __str__(self):
        return f"Settings ({self.city_default})"