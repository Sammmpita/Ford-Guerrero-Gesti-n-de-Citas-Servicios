from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import PerfilCliente

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Registro de nuevos usuarios. Asigna rol 'cliente' por defecto."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirmar contraseña')

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'telefono')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Las contraseñas no coinciden.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.username = validated_data['email']  # username requerido por AbstractUser
        user.rol = User.Rol.CLIENTE
        user.set_password(password)
        user.save()
        return user


class PerfilClienteSerializer(serializers.ModelSerializer):
    """Perfil extendido del cliente (dirección, ciudad)."""

    class Meta:
        model = PerfilCliente
        fields = ('direccion', 'ciudad', 'notas', 'fecha_creacion')
        read_only_fields = ('notas', 'fecha_creacion')


class UserSerializer(serializers.ModelSerializer):
    """Datos del usuario autenticado (lectura + actualización parcial)."""

    vendedor_perfil = serializers.SerializerMethodField()
    perfil_cliente = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'telefono', 'rol', 'vendedor_perfil', 'perfil_cliente')
        read_only_fields = ('id', 'email', 'rol', 'vendedor_perfil', 'perfil_cliente')

    def get_vendedor_perfil(self, obj):
        if obj.rol != 'vendedor':
            return None
        vendedor = getattr(obj, 'vendedor', None)
        if not vendedor:
            return None
        foto_url = None
        if vendedor.foto:
            request = self.context.get('request')
            foto_url = request.build_absolute_uri(vendedor.foto.url) if request else vendedor.foto.url
        return {
            'id': vendedor.id,
            'numero_empleado': vendedor.numero_empleado,
            'especialidad': vendedor.especialidad,
            'biografia': vendedor.biografia,
            'foto': foto_url,
            'activo': vendedor.activo,
            'fecha_ingreso': str(vendedor.fecha_ingreso),
        }


    def get_perfil_cliente(self, obj):
        if obj.rol != 'cliente':
            return None
        perfil = getattr(obj, 'perfil_cliente', None)
        if not perfil:
            return None
        return {
            'direccion': perfil.direccion,
            'ciudad': perfil.ciudad,
            'fecha_creacion': perfil.fecha_creacion.isoformat() if perfil.fecha_creacion else None,
        }


class UserAdminSerializer(serializers.ModelSerializer):
    """Para que admin liste usuarios y cambie roles."""

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'telefono', 'rol', 'is_active')
        read_only_fields = ('id', 'email')


class CreateEncargadoSerializer(serializers.Serializer):
    """Admin: crea un usuario con rol=encargado en un solo paso."""

    first_name = serializers.CharField(max_length=150)
    last_name  = serializers.CharField(max_length=150)
    email      = serializers.EmailField()
    telefono   = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password   = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este correo.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.username = validated_data['email']
        user.rol = User.Rol.ENCARGADO
        user.set_password(password)
        user.save()
        return user


class CreateVendedorSerializer(serializers.Serializer):
    """Admin: crea un usuario con rol=vendedor y su perfil Vendedor en un solo paso."""

    # Datos de usuario
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    # Datos de perfil vendedor
    numero_empleado = serializers.CharField(max_length=20)
    especialidad = serializers.CharField(max_length=120, required=False, allow_blank=True)
    fecha_ingreso = serializers.DateField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este correo.')
        return value

    def validate_numero_empleado(self, value):
        from apps.vendedores.models import Vendedor
        if Vendedor.objects.filter(numero_empleado=value).exists():
            raise serializers.ValidationError('Este número de empleado ya está en uso.')
        return value

    def create(self, validated_data):
        from apps.vendedores.models import Vendedor
        password = validated_data.pop('password')
        numero_empleado = validated_data.pop('numero_empleado')
        especialidad = validated_data.pop('especialidad', '')
        fecha_ingreso = validated_data.pop('fecha_ingreso')

        user = User(**validated_data)
        user.username = validated_data['email']
        user.rol = User.Rol.VENDEDOR
        user.set_password(password)
        user.save()

        Vendedor.objects.create(
            usuario=user,
            numero_empleado=numero_empleado,
            especialidad=especialidad,
            fecha_ingreso=fecha_ingreso,
        )
        return user
