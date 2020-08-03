
from django.urls import path, include
from .views import home, land

urlpatterns = [
    path("", land, name="home"),
    path("work/", home, name="list")
]