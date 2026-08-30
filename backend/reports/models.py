from django.db import models

class DailyReportSnapshot(models.Model):
    date = models.DateField(unique=True)
    total_orders = models.IntegerField(default=0)
    delivered_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    new_customers = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Daily Report for {self.date} - Revenue: ₹{self.total_revenue}"
