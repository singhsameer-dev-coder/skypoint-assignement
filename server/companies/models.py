from django.db import models
from accounts.models import User


class Company(models.Model):
    class Size(models.TextChoices):
        STARTUP = 'startup', '1-10'
        SMALL = 'small', '11-50'
        MEDIUM = 'medium', '51-200'
        LARGE = 'large', '201-1000'
        ENTERPRISE = 'enterprise', '1000+'

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='companies')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=200, blank=True)
    size = models.CharField(max_length=20, choices=Size.choices, blank=True)
    founded_year = models.PositiveSmallIntegerField(blank=True, null=True)
    headquarters = models.CharField(max_length=200, blank=True)
    linkedin_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'companies'
        ordering = ['name']

    def __str__(self):
        return self.name
