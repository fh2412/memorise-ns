import { Component, Input } from '@angular/core';
import { companyService } from '../../services/company.service';
import { error } from 'console';
import { ConfirmationDialogData, ConfirmDialogComponent } from '../_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-company-information',
  templateUrl: './company-information.component.html',
  styleUrl: './company-information.component.scss'
})
export class CompanyInformationComponent {

  constructor(private companyService: companyService, private dialog: MatDialog) {}

  @Input() company: any;
  @Input() userId: any;
  confirmationData: ConfirmationDialogData | undefined;

  changeCompanyDetails() {
    throw new Error('Method not implemented.');
  }

  onLeaveClick(deleteBool: boolean) {
   this.confirmationData = {
      title: 'Leave Company?',
      message: 'Are you sure you want to leave the company?'
    };
    if(deleteBool){
      this.confirmationData = {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete your company?'
      };
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: this.confirmationData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.leaveOrDeleteCompany(deleteBool);
      } 
    });
  }

  leaveOrDeleteCompany(deleteBool: boolean) {
    
    this.companyService.leaveCompany(this.userId).subscribe(
      () => {
        if(deleteBool){
          console.log("delete")
          this.companyService.deleteCompany(this.company.id).subscribe(
            () => {
              console.log("Company deleted!");
            },
            (error: any) => {
              console.log("could not delete company!: ", error);
            }
          )
        }
      },
      (error: any) => {
        console.error('Error deleting User from company: ', error);
      }
    );
  }
}
