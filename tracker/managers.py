from django.db import models


class StockManger(models.Manager):

    def below_ema(self, days):
        stocks = []
        for stock in self.all():
            if stock.is_below_ema(days):
                stocks.append(stock)
        return stocks
