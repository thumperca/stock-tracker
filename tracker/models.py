from django.db import models


class Stock(models.Model):
    symbol = models.CharField(max_length=20, primary_key=True)
    added_on = models.DateField(auto_now_add=True)
    modified_on = models.DateField(auto_now=True)


class Price(models.Model):
    stock = models.ForeignKey(Stock)
    date = models.DateField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
