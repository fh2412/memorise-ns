import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-company-information',
  templateUrl: './company-information.component.html',
  styleUrl: './company-information.component.scss'
})
export class CompanyInformationComponent {
  @Input() company: any;

  changeCompanyDetails() {
    throw new Error('Method not implemented.');
    }
}
