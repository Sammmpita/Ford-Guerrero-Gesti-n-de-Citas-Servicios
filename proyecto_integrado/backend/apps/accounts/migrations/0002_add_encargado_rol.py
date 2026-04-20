from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='rol',
            field=models.CharField(
                choices=[
                    ('cliente',   'Cliente'),
                    ('vendedor',  'Vendedor'),
                    ('admin',     'Administrador'),
                    ('encargado', 'Encargado de Taller'),
                ],
                default='cliente',
                max_length=10,
                verbose_name='rol',
            ),
        ),
    ]
