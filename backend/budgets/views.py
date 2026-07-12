from rest_framework import viewsets
from .models import Budget
from .serializers import BudgetSerializer
class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    filterset_fields = ["month", "year", "category"]
    def get_queryset(self): return Budget.objects.filter(user=self.request.user)
    def perform_create(self, serializer): serializer.save(user=self.request.user)
