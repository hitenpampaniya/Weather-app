from django.contrib import admin
from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='home'),
    path('forecast/', views.forecast, name='forecast'),
    path('favorites/', views.favorites, name='favorites'),
    path('compare/', views.compare, name='compare'),
    path('alerts/', views.alerts, name='alerts'),
    path('settings/', views.settings, name='settings'),
    path('remove/<str:city>/', views.remove_favorite, name='remove_favorite'),
]
