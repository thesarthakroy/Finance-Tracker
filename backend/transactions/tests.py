from datetime import date
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Transaction
class TransactionApiTests(APITestCase):
    def setUp(self):
        self.user=User.objects.create_user('alice', password='StrongPass123'); self.client.force_authenticate(self.user)
    def test_create_and_list_own_transactions(self):
        response=self.client.post('/api/transactions/', {'amount':'200.00','category':'Food','transaction_type':'expense','date':date.today()})
        self.assertEqual(response.status_code,status.HTTP_201_CREATED); self.assertEqual(Transaction.objects.count(),1)
        self.assertEqual(self.client.get('/api/transactions/').data['count'],1)
