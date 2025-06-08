import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navigation-error',
  standalone: false,
  templateUrl: './navigation-error.component.html',
  styleUrl: './navigation-error.component.scss'
})
export class NavigationErrorComponent {
  errorCode: string = '';
  errorTitle: string = '';
  errorMessage: string = '';
  imagePath: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.errorCode = params['errorId'];
      console.log("ERROR CODE: ", this.errorCode);
      this.setErrorContent();
    });
  }

  setErrorContent(): void {
    switch (this.errorCode) {
      case '404':
        this.errorTitle = 'Page Not Found';
        this.errorMessage = 'The page you are looking for doesn\'t exist or has been moved.';
        this.imagePath = '/assets/img/404_image.png';
        break;
      case '401':
        this.errorTitle = 'Unauthorized Access';
        this.errorMessage = 'You don\'t have permission to access this resource.';
        this.imagePath = '/assets/img/404_image.png';
        break;
      default:
        this.errorTitle = 'Error';
        this.errorMessage = 'An unexpected error occurred.';
        this.imagePath = '/assets/img/404_image.png';
        break;
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
