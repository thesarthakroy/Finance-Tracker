from django.urls import path
from .views import MonthlyReportView, ExportReportView
urlpatterns = [path("reports/monthly/", MonthlyReportView.as_view()), path("reports/export/<str:export_format>/", ExportReportView.as_view())]
