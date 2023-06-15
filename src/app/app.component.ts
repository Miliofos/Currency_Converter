import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currencyConverterForm!: FormGroup;
  currencies: string[] = [];
  amount2: number = 0;
  exchangeRates: any;
  previousCurrency1: string = '';
  previousCurrency2: string = '';

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    // Initialize the form
    this.currencyConverterForm = this.formBuilder.group({
      amount1: new FormControl(),
      currency1: new FormControl('UAH'),
      amount2: new FormControl(),
      currency2: new FormControl('USD')
    });

    // Get the conversion rates
    this.getConversionRates();

    // Watch for changes in the entered amount
    this.currencyConverterForm.get('amount1')?.valueChanges.subscribe(() => {
      this.convertCurrency();
    });

    // Watch for changes in the selected currency 1
    this.currencyConverterForm.get('currency1')?.valueChanges.subscribe(() => {
      this.updateConvertedCurrencies();
      this.convertCurrency();
    });

    // Watch for changes in the selected currency 2
    this.currencyConverterForm.get('currency2')?.valueChanges.subscribe(() => {
      this.convertCurrency();
      this.swapCurrencies();
    });
  }

  // Get the conversion rates from an external API
  getConversionRates() {
    this.http.get<any>('https://api.exchangerate-api.com/v4/latest/UAH').subscribe(data => {
      this.exchangeRates = data.rates;
      this.currencies = Object.keys(data.rates);
      this.updateConvertedCurrencies();
      this.convertCurrency();
    });
  }

  // Update the list of converted currencies
  updateConvertedCurrencies(): string[] {
    const currency1 = this.currencyConverterForm.get('currency1')?.value;
    const currency2 = this.currencyConverterForm.get('currency2')?.value;

    const filteredCurrencies = this.currencies.filter(currency => currency !== currency1);
    if (currency2 === currency1) {
      this.currencyConverterForm.get('currency2')?.setValue(this.previousCurrency1);
    }

    this.previousCurrency1 = currency1;
    this.previousCurrency2 = currency2;
    
    return filteredCurrencies;
  }
  
  // Convert the currency
  convertCurrency() {
    const amount1 = this.currencyConverterForm.get('amount1')?.value;
    const currency1 = this.currencyConverterForm.get('currency1')?.value;
    const currency2 = this.currencyConverterForm.get('currency2')?.value;

    this.http.get<any>(`https://api.exchangerate-api.com/v4/latest/UAH`).subscribe(data => {
      this.exchangeRates = data.rates;
      const rate1 = this.exchangeRates[currency1];
      const rate2 = this.exchangeRates[currency2];
      this.amount2 = (amount1 / rate1) * rate2;
    });
  }

  // Swap the currencies
  swapCurrencies() {
    const currency1 = this.currencyConverterForm.get('currency1')?.value;
    const currency2 = this.currencyConverterForm.get('currency2')?.value;
    if (currency1 === currency2) {
      this.currencyConverterForm.get('currency2')?.setValue(this.previousCurrency1);
      this.currencyConverterForm.get('currency1')?.setValue(this.previousCurrency2);
    } else {
      this.previousCurrency1 = currency1;
      this.previousCurrency2 = currency2;
    }
  }
  
  // Handler for the button click to swap currencies
  swapCurrenciesButton() {
    const currency1 = this.currencyConverterForm.get('currency1')?.value;
    const currency2 = this.currencyConverterForm.get('currency2')?.value;
    
    this.currencyConverterForm.get('currency1')?.setValue(currency2);
    this.currencyConverterForm.get('currency2')?.setValue(currency1);
  }
}
