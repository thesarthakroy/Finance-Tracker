from django.conf import settings
from django.db import models
class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets")
    category = models.CharField(max_length=80)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "category", "month", "year"], name="unique_category_budget")]
        indexes = [models.Index(fields=["user", "month", "year"])]
