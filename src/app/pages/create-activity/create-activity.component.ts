import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-activity',
  standalone: false,
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss'
})
export class CreateActivityComponent {
  activityForm: FormGroup;
  selectedImageUrl: string | null = null;
  location: string | null = null;
  
  constructor(private fb: FormBuilder) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      isPrivate: [false],
      groupSize: [5, [Validators.min(1), Validators.max(20)]],
      costs: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  addLocation() {
    // In a real application, this would open a location picker
    // For demonstration purposes, we're just setting a placeholder
    this.location = 'Central Park, New York';
  }

  addPicture() {
    // In a real application, this would open a file picker
    // For demonstration purposes, we're just setting a placeholder image
    this.selectedImageUrl = '/api/placeholder/600/400';
  }

  onSubmit() {
    if (this.activityForm.valid) {
      console.log('Form submitted:', this.activityForm.value);
      console.log('Location:', this.location);
      console.log('Image URL:', this.selectedImageUrl);
    }
  }
}
