from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('servicio', '0007_cita_motivo_cancelacion_comentario_cliente'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Cita',
            new_name='CitaServicio',
        ),
    ]
