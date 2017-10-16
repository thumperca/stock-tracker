"""
Script to crawl NSE website and get historic prices for last two years
"""

#   Core Python dependencies
import sys
import datetime
from zipfile import ZipFile, BadZipfile
from io import BytesIO

#   Third party dependencies
import requests
import pandas as pd
from bs4 import BeautifulSoup

#   Django framework dependencies
from django.core.management.base import BaseCommand

#   App based dependencies
from tracker.models import Stock, Price


class URLReader(object):

    def read_archive(self, date, file_type):
        url = self.get_url(date, file_type)
        if not url:
            return
        return self.read_url(url, file_type)

    def get_url(self, date, file_type):
        url = ('https://www.nseindia.com/ArchieveSearch?h_filetype={}'
               '&date={}&section=EQ'.format(file_type, date.strftime('%d-%m-%Y')))
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        anchor = soup.find('a')
        if not anchor:
            print('no data for date', date)
            return
        return 'https://www.nseindia.com' + anchor['href']

    def read_url(self, url, file_type):
        if file_type == 'eqbhav':
            return self._read_zip(url)
        elif file_type == 'eqmto':
            return self._read_dat(url)

    def _read_zip(self, url):
        filename = url.split('/')[-1].replace('.zip', '')
        response = requests.get(url)
        try:
            file = ZipFile(BytesIO(response.content))
            with file.open(filename) as f:
                data = pd.read_csv(f, header=0, delimiter=',')
        except BadZipfile:
            print('failed to read zip file')
            return
        else:
            return data

    def _read_dat(self, url):
        response = requests.get(url)
        data = response.content.decode('utf-8').split('\n')
        return data


class DeliveryImporter(URLReader):

    def import_delivery(self, date):
        data = self.read_archive(date, file_type='eqmto')
        self._import_data(date, data)

    def _import_data(self, date, data):
        for stock in self._read_data(data):
            symbol = stock.pop('symbol')
            Price.objects.filter(stock_id=symbol, date=date).update(**stock)

    def _read_data(self, data):
        for stock in data:
            stock = stock.split(',')
            if len(stock) < 7:
                continue
            if stock[3] != 'EQ':
                continue
            data = {
                'symbol': stock[2],
                'delivery': float(stock[6]),
                'quantity': int(stock[4]),
            }
            yield data


class ArchiveImporter(DeliveryImporter):

    def import_archive(self, date):
        dataset = self.read_archive(date, file_type='eqbhav')
        if dataset is None:
            return
        self.import_data(date, dataset)
        self.import_delivery(date)

    def import_data(self, date, dataset):
        stocks, data = [], []
        for quote in self.iter_data(dataset):
            if quote['symbol'] not in self.stocks:
                self.add_stock(quote)
            data.append(Price(
                stock_id=quote['symbol'],
                price=quote['price'],
                quantity=quote['quantity'],
                date=date,
            ))
            stocks.append(quote['symbol'])
        Price.objects.bulk_create(data)
        Stock.objects.filter(pk__in=stocks).update(modified_on=date)

    def iter_data(self, dataset):
        for index, row in dataset.iterrows():
            if row['SERIES'] != 'EQ':
                continue
            data = {
                'symbol': row['SYMBOL'],
                'price': row['CLOSE'],
                'quantity': row['TOTTRDQTY']
            }
            yield data


class ArchiveProcessor(ArchiveImporter):

    def __init__(self):
        self.stocks = set(Stock.objects.all().values_list('symbol', flat=True))

    def add_stock(self, quote):
        stock = Stock(symbol=quote['symbol'], last_price=quote['price'])
        stock.save()
        self.stocks.add(stock.pk)


class Command(ArchiveProcessor, BaseCommand):

    help = 'Import historic prices from NSE website'

    def handle(self, *args, **options):
        """Handle script execution"""
        date, end_date = self.get_dates()
        if not date:
            sys.exit('Up to date')
        while date <= end_date:
            print('\nprocessing date', date)
            self.import_archive(date)
            date += datetime.timedelta(days=1)

    def get_dates(self):
        try:
            price = Price.objects.all().order_by('-id')[0]
        except IndexError:
            today = datetime.date.today()
            start = today - datetime.timedelta(days=(365 * 1.5))
            return (start, today)
        today = datetime.date.today()
        if price.date == today:
            return None, None
        start_date = price.date + datetime.timedelta(days=1)
        return (start_date, today)
