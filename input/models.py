from django.db import models
from django.contrib.auth.models import User


class RecipeHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    url = models.URLField()
    date_time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255)
    ingredients = models.JSONField(default=list, blank=True)  # list, optional
    instructions = models.TextField(blank=True, null=True)  # list, optional

    class Meta:
        unique_together = ["user", "url"]
        ordering = ["-date_time"]  # newest first by default

    def __str__(self):
        return f"{self.user.username} - {self.title}"
