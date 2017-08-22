import csv
import os
from datetime import datetime

from django.core.management.base import BaseCommand
from django.conf import settings

from tracker.models import Stock, Price


IMPORT_DIR = os.path.join(settings.BASE_DIR, 'imports')


class Command(BaseCommand):

    help = 'Import historic prices from CSV file'

    def handle(self, *args, **options):
        """Handle script execution"""
        files = self.get_files()
        for file in files:
            self.import_data(file)

    def get_files(self):
        """Returns list of all csv files in 'imports' directory"""
        all_files = os.listdir(IMPORT_DIR)
        csv_files = [file for file in all_files if file.endswith('.csv')]
        return csv_files

    def import_data(self, file):
        """Import date from a single CSV file"""
        symbol = file.split('.')[0].upper()
        stock, created = Stock.objects.get_or_create(symbol=symbol)
        data, existing_data = [], self.get_existing_data(stock)
        for raw_date, price in self.get_row(file, symbol):
            date = datetime.strptime(raw_date, '%d-%b-%Y').date()
            if existing_data and str(date) in existing_data:
                continue
            entry = Price(stock=stock, date=date, price=price)
            data.append(entry)
        Price.objects.bulk_create(data, 2000)

    def get_row(self, file, symbol):
        """Generator method to get a row from CSV file"""
        file_path = os.path.join(IMPORT_DIR, file)
        with open(file_path, 'r') as f:
            reader = csv.reader(f, delimiter=',')
            for row in reader:
                if row[0] != symbol:
                    continue
                price = float(row[8].strip())
                yield (row[2].strip(), price)

    def get_existing_data(self, stock):
        """
        Returns dict with existing data for a stock
        The key is date and value is closing stock price
        """

        data = Price.objects.filter(stock=stock)
        return {str(entry.date): entry.price for entry in data}
