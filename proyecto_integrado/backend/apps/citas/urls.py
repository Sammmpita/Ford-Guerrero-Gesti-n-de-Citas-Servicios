from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CitaViewSet

app_name = 'citas'

router = DefaultRouter()
router.register('', CitaViewSet, basename='citas')

urlpatterns = [
    path('', include(router.urls)),
]
