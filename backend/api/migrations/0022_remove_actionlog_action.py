# Generated by Django 5.2.1 on 2025-05-31 22:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_actionlog_objectlaststatus'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='actionlog',
            name='action',
        ),
    ]
