import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-company-information',
  templateUrl: './company-information.component.html',
  styleUrl: './company-information.component.scss'
})
export class CompanyInformationComponent {

  @Input() company: any;
  @Input() userId: any;

  changeCompanyDetails() {
    throw new Error('Method not implemented.');
  }

  leaveOrDeleteCompany(deleteBool: boolean) {
    if(deleteBool){
      console.log("delete")
    }
    else{
      console.log("leave")
    }
  }
}
