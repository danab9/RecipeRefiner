from django.contrib.auth.models import User
from rest_framework import serializers
from .models import RecipeHistory


class RecipeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeHistory
        fields = "__all__"
