import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/userService';
import { companyService } from '../../services/company.service';
import { MemoriseUser } from '../../models/userInterface.model';
import { CompanyData } from '../../components/_dialogs/company-dialog/company-dialog.component';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent implements OnInit {
  user!: MemoriseUser;
  loggedInUserId: string | null = null;
  company!: CompanyData;

  constructor(private userService: UserService, private companyService: companyService) {}
  async ngOnInit() {
    this.loggedInUserId = this.userService.getLoggedInUserId();
    if(this.loggedInUserId){
      this.userService.getUser(this.loggedInUserId).subscribe(
        (response) => {
          this.user = response;
          if(this.user.company_id){ 
            this.getCompany();
          }
        },
        (error) => {
          console.error('Error fetching user:', error);
        }
      );
    }
  }
  getCompany(): void {
    if(this.loggedInUserId != null){
      this.companyService.getUserCompany(this.loggedInUserId).subscribe(
        (response) => {
          this.company = response;
        },
        (error) => {
          console.log('Error fetching compnay', error);
        }
      );
    }
  }
  
  addActivity(){
    console.log("Add Activity");
  };
}
