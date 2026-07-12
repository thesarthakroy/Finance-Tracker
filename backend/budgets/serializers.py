from decimal import Decimal
from django.db.models import Sum
from rest_framework import serializers
from transactions.models import Transaction
from .models import Budget
class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    class Meta:
        model = Budget
        fields = ("id", "category", "monthly_limit", "month", "year", "spent", "remaining", "status")
        read_only_fields = ("id", "spent", "remaining", "status")
    def validate_month(self, value):
        if not 1 <= value <= 12: raise serializers.ValidationError("Month must be between 1 and 12.")
        return value
    def validate_monthly_limit(self, value):
        if value <= 0: raise serializers.ValidationError("Limit must be greater than zero.")
        return value
    def _spent(self, obj):
        return Transaction.objects.filter(user=obj.user, category=obj.category, transaction_type="expense", date__year=obj.year, date__month=obj.month).aggregate(total=Sum("amount"))["total"] or Decimal("0")
    def get_spent(self, obj): return self._spent(obj)
    def get_remaining(self, obj): return obj.monthly_limit - self._spent(obj)
    def get_status(self, obj): return "over_budget" if self._spent(obj) > obj.monthly_limit else "safe"
