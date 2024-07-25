import { Component, Input } from '@angular/core';
import { companyService } from '../../services/company.service';
import { error } from 'console';

@Component({
  selector: 'app-company-information',
  templateUrl: './company-information.component.html',
  styleUrl: './company-information.component.scss'
})
export class CompanyInformationComponent {

  constructor(private companyService: companyService) {}

  @Input() company: any;
  @Input() userId: any;

  changeCompanyDetails() {
    throw new Error('Method not implemented.');
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
