from django.conf import settings
from django.db import models

class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=80)
    transaction_type = models.CharField(max_length=7, choices=TransactionType.choices)
    description = models.CharField(max_length=500, blank=True)
    date = models.DateField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [models.Index(fields=["user", "date"]), models.Index(fields=["user", "transaction_type"])]
