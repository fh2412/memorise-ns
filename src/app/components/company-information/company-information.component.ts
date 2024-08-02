import { Component, Input } from '@angular/core';
import { companyService } from '../../services/company.service';
import { ConfirmationDialogData, ConfirmDialogComponent } from '../_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CompanyDialogComponent } from '../_dialogs/company-dialog/company-dialog.component';
import { LinkModalComponent } from '../_dialogs/link-modal/link-modal.component';

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

  joinCompany() {
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

  openEditCreateDialog(): void {
    const dialogRef = this.dialog.open(CompanyDialogComponent, {
      width: '300px',
      data: this.company ? this.company : { name: '', phone: '', email: '', website: '' }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        if (this.company) {
          await this.companyService.updateCompany(this.company.id, result).subscribe(
            response => {
              console.log('Company updated successfully:', response);
            },
            error => {
              console.error('Error updating company:', error);
            }
          );
        } else {
          await this.companyService.createCompany(this.userId, result).subscribe(
            response => {
              console.log(response);
            },
            error => {
              console.error('Error creating company:', error);
            }
          );
        }
      }
    });
  }

  async openInviteDialog(): Promise<void> {
    await this.companyService.generateCode(this.company.id).subscribe(
      response => {
        console.log('Company updated successfully:', response);
        const dialogRef = this.dialog.open(LinkModalComponent, {
          data: { link: response.code, text: 'Your Company Join-Code:' },
          width: '500px',
        });
      },
      error => {
        console.error('Error updating company:', error);
      }
    );



  }
}
