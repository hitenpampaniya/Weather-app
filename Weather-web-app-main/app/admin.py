from django.contrib import admin
from .models import*

# Register your models here.
admin.site.register(FavoriteCity)
admin.site.register(WeatherAlert)
admin.site.register(WeatherData)
admin.site.register(UserSettings)
admin.site.register(Forecast)
