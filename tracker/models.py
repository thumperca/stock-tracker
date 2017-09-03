from django.db import models
from tracker.mixins import StockMixin


class Stock(models.Model, StockMixin):
    symbol = models.CharField(max_length=20, primary_key=True)
    last_price = models.DecimalField(max_digits=9, decimal_places=2, null=True)
    added_on = models.DateField(auto_now_add=True)
    modified_on = models.DateField(auto_now=True)


class Price(models.Model):
    stock = models.ForeignKey(Stock, db_column='symbol')
    date = models.DateField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
