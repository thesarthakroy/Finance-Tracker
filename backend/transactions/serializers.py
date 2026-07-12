from rest_framework import serializers
from .models import Transaction
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ("id", "amount", "category", "transaction_type", "description", "date", "created_at")
        read_only_fields = ("id", "created_at")
    def validate_amount(self, value):
        if value <= 0: raise serializers.ValidationError("Amount must be greater than zero.")
        return value
