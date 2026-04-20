from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import CreateEncargadoView, CreateVendedorView, MeView, PerfilClienteView, RegisterView, UserAdminViewSet

app_name = 'accounts'

router = DefaultRouter()
router.register('users', UserAdminViewSet, basename='users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('mi-perfil-cliente/', PerfilClienteView.as_view(), name='mi-perfil-cliente'),
    path('crear-vendedor/',  CreateVendedorView.as_view(),  name='crear-vendedor'),
    path('crear-encargado/', CreateEncargadoView.as_view(), name='crear-encargado'),
    path('', include(router.urls)),
]
