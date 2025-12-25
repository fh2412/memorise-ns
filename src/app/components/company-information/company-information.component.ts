import { Component, Input, inject } from '@angular/core';
import { companyService } from '@services/company.service';
import { ConfirmationDialogData, ConfirmDialogComponent } from '../_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CompanyDialogComponent } from '../_dialogs/company-dialog/company-dialog.component';
import { ShareFriendCodeDialogComponent } from '../_dialogs/share-friend-code-dialog/share-friend-code-dialog.component';
import { MemoriseCompany } from '@models/company.model';

@Component({
    selector: 'app-company-information',
    templateUrl: './company-information.component.html',
    styleUrl: './company-information.component.scss',
    standalone: false
})
export class CompanyInformationComponent {
  private companyService = inject(companyService);
  private dialog = inject(MatDialog);


  @Input()company!: MemoriseCompany;
  @Input() userId!: string;
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
            (error) => {
              console.log("could not delete company!: ", error);
            }
          )
        }
      },
      (error) => {
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
        this.dialog.open(ShareFriendCodeDialogComponent, {
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
