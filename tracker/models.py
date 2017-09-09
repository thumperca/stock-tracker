import datetime
from django.db import models
from django.utils import timezone
from tracker.mixins import StockMixin
from tracker.managers import StockManger


class Stock(models.Model, StockMixin):
    symbol = models.CharField(max_length=20, primary_key=True)
    last_price = models.DecimalField(max_digits=9, decimal_places=2, null=True)
    modified_on = models.DateField()

    objects = StockManger()

    def save(self, *args, **kwargs):
        date = kwargs.pop('modified_on', timezone.now().date())
        if type(date) is not datetime.date:
            date = timezone.now().date()
        self.modified_on = date
        super().save(*args, **kwargs)


class Price(models.Model):
    stock = models.ForeignKey(Stock, db_column='symbol')
    date = models.DateField()
    price = models.DecimalField(max_digits=9, decimal_places=2)
