from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Cita',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cliente', models.CharField(max_length=100)),
                ('telefono', models.CharField(max_length=10)),
                ('modelo_auto', models.CharField(max_length=50)),
                ('placas', models.CharField(max_length=15)),
                ('servicio', models.CharField(choices=[('Preventivo', 'Mantenimiento Preventivo'), ('Frenos', 'Sistema de Frenos'), ('Suspension', 'Suspensión'), ('Electrico', 'Sistema Eléctrico'), ('Otro', 'Otro (Especificar)')], max_length=100)),
                ('detalles_falla', models.TextField(blank=True, null=True)),
                ('fecha', models.DateField()),
                ('hora', models.TimeField()),
                ('estatus', models.CharField(choices=[('Pendiente', 'Pendiente'), ('En Proceso', 'En Proceso'), ('Terminado', 'Terminado'), ('Cancelado', 'Cancelado')], default='Pendiente', max_length=20)),
                ('bahia_asignada', models.CharField(choices=[('Express', 'Alta (Express)'), ('Medio', 'Media'), ('Largo', 'Baja (Largo Plazo)'), ('Contingencia', 'Contingencia')], default='Express', max_length=20)),
                ('notas_admin', models.TextField(blank=True, null=True)),
                ('motivo_cancelacion', models.TextField(blank=True, null=True)),
                ('comentario_cliente', models.TextField(blank=True, null=True)),
            ],
        ),
    ]
