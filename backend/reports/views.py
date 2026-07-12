from io import BytesIO
import csv
import calendar
from datetime import date
import pandas as pd
from django.db.models import Sum
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from budgets.models import Budget
from transactions.models import Transaction

def transaction_frame(user, month=None, year=None):
    query = Transaction.objects.filter(user=user)
    if month: query = query.filter(date__month=month)
    if year: query = query.filter(date__year=year)
    return pd.DataFrame(list(query.values("date", "category", "transaction_type", "amount", "description")))

def currency(value):
    return f"Rs. {float(value or 0):,.0f}"

def financial_insights(user, month, year):
    current = Transaction.objects.filter(user=user, date__month=month, date__year=year)
    expenses = current.filter(transaction_type="expense")
    total_expenses = expenses.aggregate(total=Sum("amount"))["total"] or 0
    income = current.filter(transaction_type="income").aggregate(total=Sum("amount"))["total"] or 0
    insights = []
    categories = list(expenses.values("category").annotate(total=Sum("amount")).order_by("-total"))
    if categories and total_expenses:
        top = categories[0]
        insights.append(f"Your highest spending category this month was {top['category']} ({currency(top['total'])}), accounting for {float(top['total'] / total_expenses * 100):.0f}% of total expenses.")
    previous_month, previous_year = (month - 1, year) if month > 1 else (12, year - 1)
    previous = Transaction.objects.filter(user=user, date__month=previous_month, date__year=previous_year)
    previous_income = previous.filter(transaction_type="income").aggregate(total=Sum("amount"))["total"] or 0
    previous_expenses = previous.filter(transaction_type="expense").aggregate(total=Sum("amount"))["total"] or 0
    if income and previous_income:
        current_rate = float((income - total_expenses) / income * 100)
        previous_rate = float((previous_income - previous_expenses) / previous_income * 100)
        change = current_rate - previous_rate
        insights.append(f"Your savings rate {'improved' if change >= 0 else 'declined'} by {abs(change):.0f}% compared to the previous month.")
    entertainment = expenses.filter(category__iexact="Entertainment").aggregate(total=Sum("amount"))["total"] or 0
    previous_entertainment = previous.filter(transaction_type="expense", category__iexact="Entertainment").aggregate(total=Sum("amount"))["total"] or 0
    if entertainment and previous_entertainment:
        change = float((entertainment - previous_entertainment) / previous_entertainment * 100)
        insights.append(f"Entertainment spending {'increased' if change >= 0 else 'decreased'} by {abs(change):.0f}% compared to the previous month.")
    for budget in Budget.objects.filter(user=user, month=month, year=year):
        spent = expenses.filter(category__iexact=budget.category).aggregate(total=Sum("amount"))["total"] or 0
        if spent > budget.monthly_limit:
            insights.append(f"You exceeded your {budget.category} budget by {currency(spent - budget.monthly_limit)}.")
    if total_expenses:
        days = date.today().day if (month == date.today().month and year == date.today().year) else calendar.monthrange(year, month)[1]
        insights.append(f"Your average daily expense is {currency(total_expenses / days)}.")
    largest = current.order_by("-amount").first()
    if largest:
        insights.append(f"Your largest transaction was {largest.category} {currency(largest.amount)}.")
    return insights or ["Add transactions to receive personalised financial insights."]

class MonthlyReportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        today = date.today(); month = int(request.query_params.get("month", today.month)); year = int(request.query_params.get("year", today.year))
        qs = Transaction.objects.filter(user=request.user, date__month=month, date__year=year)
        totals = qs.values("transaction_type").annotate(total=Sum("amount"))
        amounts = {row["transaction_type"]: row["total"] for row in totals}
        category = qs.filter(transaction_type="expense").values("category").annotate(total=Sum("amount")).order_by("-total")
        return Response({"month": month, "year": year, "income": amounts.get("income", 0), "expenses": amounts.get("expense", 0), "savings": amounts.get("income", 0) - amounts.get("expense", 0), "by_category": list(category), "insights": financial_insights(request.user, month, year)})

class ExportReportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, export_format):
        today = date.today(); month = int(request.query_params.get("month", today.month)); year = int(request.query_params.get("year", today.year))
        frame = transaction_frame(request.user, request.query_params.get("month"), request.query_params.get("year"))
        if frame.empty: frame = pd.DataFrame(columns=["date", "category", "transaction_type", "amount", "description"])
        filename = f"finance-report.{export_format}"
        if export_format == "csv":
            response = HttpResponse(content_type="text/csv"); response["Content-Disposition"] = f'attachment; filename="{filename}"'
            frame.to_csv(response, index=False); return response
        if export_format == "excel":
            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer: frame.to_excel(writer, index=False, sheet_name="Transactions")
            response = HttpResponse(output.getvalue(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); response["Content-Disposition"] = f'attachment; filename="{filename}"'; return response
        output = BytesIO(); pdf = canvas.Canvas(output, pagesize=letter); pdf.setFont("Helvetica-Bold", 16); pdf.drawString(50, 750, "Personal Finance Report"); pdf.setFont("Helvetica-Bold", 11); pdf.drawString(50, 726, "Financial insights"); pdf.setFont("Helvetica", 9)
        y = 708
        for insight in financial_insights(request.user, month, year):
            pdf.drawString(55, y, f"- {insight[:115]}"); y -= 16
            if y < 70: pdf.showPage(); y = 750
        pdf.setFont("Helvetica-Bold", 11); pdf.drawString(50, y, "Transactions"); pdf.setFont("Helvetica", 9); y -= 18
        for row in frame.itertuples(index=False):
            pdf.drawString(50, y, f"{row.date} | {row.transaction_type} | {row.category} | Rs. {row.amount}"); y -= 18
            if y < 50: pdf.showPage(); y = 750
        pdf.save(); response = HttpResponse(output.getvalue(), content_type="application/pdf"); response["Content-Disposition"] = f'attachment; filename="{filename}"'; return response
