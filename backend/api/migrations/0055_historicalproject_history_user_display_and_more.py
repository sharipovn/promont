# Generated by Django 5.2.1 on 2025-07-01 13:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0054_historicalproject'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicalproject',
            name='history_user_display',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='history_user_display',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
