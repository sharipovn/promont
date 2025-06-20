# Generated by Django 5.2.1 on 2025-06-19 07:30

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_alter_staffuser_profile_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobPosition',
            fields=[
                ('position_id', models.AutoField(primary_key=True, serialize=False)),
                ('position_name', models.CharField(max_length=100, unique=True)),
                ('position_description', models.TextField(blank=True)),
                ('create_time', models.DateTimeField(auto_now_add=True)),
                ('update_time', models.DateTimeField(auto_now=True)),
                ('create_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_positions', to=settings.AUTH_USER_MODEL)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='job_positions', to='api.department')),
            ],
            options={
                'verbose_name': 'Job Position',
                'verbose_name_plural': 'Job Positions',
                'db_table': 'job_position',
            },
        ),
        migrations.AlterField(
            model_name='staffuser',
            name='position',
            field=models.ForeignKey(blank=True, db_column='position_id', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_members', to='api.jobposition'),
        ),
    ]
