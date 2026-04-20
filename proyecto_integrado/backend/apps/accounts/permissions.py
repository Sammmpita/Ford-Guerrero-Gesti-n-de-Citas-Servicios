from rest_framework.permissions import BasePermission


class IsCliente(BasePermission):
    """Solo usuarios con rol 'cliente'."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'cliente'


class IsVendedor(BasePermission):
    """Solo usuarios con rol 'vendedor'."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'vendedor'


class IsAdmin(BasePermission):
    """Solo usuarios con rol 'admin'."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'


class IsVendedorOrAdmin(BasePermission):
    """Vendedor o admin."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.rol in ('vendedor', 'admin')
        )


class IsOwnerOrAdmin(BasePermission):
    """
    El objeto le pertenece al usuario, o el usuario es admin.
    Útil para que un cliente solo vea/edite sus propias citas.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.rol == 'admin':
            return True
        # Para Cita: el cliente es el dueño
        if hasattr(obj, 'cliente'):
            return obj.cliente == request.user
        # Para Vendedor: el vendedor es el dueño
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        return False
