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
      //router.put('/leave/:id', async (req, res)
      //router.delete('/delete/:id', async (req, res)
    }
    else{
      console.log("leave")
      //router.put('/leave/:id', async (req, res)
    }
  }
}
