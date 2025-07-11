# Generated by Django 5.1.4 on 2025-07-11 19:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_documentcategory_remove_service_actual_charge_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportingDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('file', models.FileField(upload_to='supporting_documents/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='supporting_documents', to='api.service')),
            ],
        ),
    ]
