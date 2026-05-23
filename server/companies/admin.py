from django.contrib import admin
from companies.models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'industry', 'size', 'is_verified', 'created_at')
    list_filter = ('size', 'is_verified')
    search_fields = ('name', 'industry', 'headquarters')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)
