# account/models.py

# 📦 Import necessary modules and classes
import uuid # 🔗 Import UUID module for generating primary keys
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, editable=False)  # 🔑 Define UUIDField as primary key
    username = models.CharField(max_length=100, unique=True, blank=False, validators=[RegexValidator(regex=r'^[\w\-]+$', message='Username must contain only letters, numbers, underscores, and hyphens, and be 100 characters or fewer.', code='invalid_username')], error_messages={'unique': 'A user with that username already exists.', 'max_length': 'Username must be 100 characters or fewer.'})
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    
    # 🔗 Define Many-to-Many relationship with Group and Permission model
    groups = models.ManyToManyField(Group, related_name='users')
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name='users'
    )
    
    # 🔑 Define required fields for user creation
    # For testing purposes only
    REQUIRED_FIELDS = ['email']

    # 🔑 In production, uncomment the lines below and remove the above line
    # REQUIRED_FIELDS = ['username']
    # USERNAME_FIELD = 'email'

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        unique_together = [('username',), ('email',)]
        db_table = 'user'
        abstract = False

    def save(self, *args, **kwargs):
        if not self.id:
            # 🔑 Generate UUID for the user ID if not provided
            self.id = uuid.uuid4()
        # 💾 Save the user instance to the database
        super().save(*args, **kwargs)

    def __str__(self):
        # 🔍 Return email as the string representation of the user instance
        return self.email