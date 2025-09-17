import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TransactionPublic } from '../services/transaction.service';

interface FundBalance {
  fund_name: string;
  current_balance: number;
}

interface SavingsLedgerData {
  total_balance: number;
  fund_balances: FundBalance[];
  recent_activity: TransactionPublic[];
}

@Component({
  selector: 'app-savings-ledger',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './savings-ledger.component.html',
})
export class SavingsLedgerComponent implements OnInit {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;
  private refresh$ = new BehaviorSubject<void>(undefined);

  ledgerData$!: Observable<SavingsLedgerData>;

  ngOnInit(): void {
    this.ledgerData$ = this.refresh$.pipe(
      switchMap(() => this.http.get<SavingsLedgerData>(`${this.baseUrl}/savings-ledger`))
    );
  }

  refreshData(): void {
    this.refresh$.next();
  }
}
