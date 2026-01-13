// choose-plan-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'FREE' | 'PRO' | 'UNLIMITED';
  name: string;
  price: string;
  period?: string;
  storage: string;
  features: PlanFeature[];
  highlighted?: boolean;
  currentPlan?: boolean;
}

@Component({
  selector: 'app-choose-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatListModule
  ],
  templateUrl: './choose-plan-dialog.component.html',
  styleUrls: ['./choose-plan-dialog.component.scss']
})
export class ChoosePlanDialogComponent {
  plans: Plan[] = [
    {
      id: 'FREE',
      name: 'Free',
      price: '0',
      storage: '5GB',
      features: [
        { text: 'Basic storage', included: true },
        { text: 'Standard support', included: true },
        { text: 'Single device sync', included: true },
        { text: 'Advanced features', included: false },
        { text: 'Priority support', included: false },
        { text: 'Unlimited storage', included: false }
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: '9.99',
      period: 'month',
      storage: '100GB',
      features: [
        { text: 'Extended storage', included: true },
        { text: 'Priority support', included: true },
        { text: 'Multi-device sync', included: true },
        { text: 'Advanced features', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'Unlimited storage', included: false }
      ]
    },
    {
      id: 'UNLIMITED',
      name: 'UNLIMITED',
      price: '19.99',
      period: 'month',
      storage: 'Unlimited',
      highlighted: true,
      features: [
        { text: 'Unlimited storage', included: true },
        { text: 'Premium support', included: true },
        { text: 'Unlimited device sync', included: true },
        { text: 'All advanced features', included: true },
        { text: 'Team collaboration', included: true },
        { text: 'Priority processing', included: true }
      ]
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<ChoosePlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentPlan?: 'FREE' | 'PRO' | 'UNLIMITED' }
  ) {
    // Mark current plan if provided
    if (data?.currentPlan) {
      const currentPlan = this.plans.find(p => p.id === data.currentPlan);
      if (currentPlan) {
        currentPlan.currentPlan = true;
      }
    }
  }

  selectPlan(plan: Plan): void {
    this.dialogRef.close(plan.id);
  }

  close(): void {
    this.dialogRef.close();
  }
}