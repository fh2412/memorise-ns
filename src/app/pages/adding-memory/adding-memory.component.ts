import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '../../services/memory.service';
import { UserService } from '../../services/userService';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrl: './adding-memory.component.css'
})
export class AddingMemoryComponent {  
  
  @ViewChild('datepicker') datepicker: MatDatepicker<any> | undefined;
  @ViewChild('rangePicker') rangePicker: MatDatepicker<any> | undefined;


  isRangeSelected = false;
  memoryForm: FormGroup;
  userId: string | null | undefined;
  emailArray: any;
  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, public memoryService: MemoryService, private userService: UserService) {
    this.memoryForm = this.formBuilder.group({
      creator_id: [this.userId], // replace with actual creator ID
      title: ['', Validators.required],
      description: [''],
      firestore_bucket_url: [''],
      location_id: ['456'], // replace with actual location ID
      memory_date: [null],
      memory_date_range: [null],
      title_pic: [''],
    });
  }
  async ngOnInit() {
    await this.userService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
    this.memoryForm.patchValue({ creator_id: this.userId });
  }

  onSelectedValuesChange(selectedValues: string[]) {
    this.emailArray = selectedValues.map(str => str.match(/\(([^)]+)\)/)?.[1] || null).filter(email => email !== null);
    console.log(this.emailArray);
  }

  toggleDateRange() {
    this.isRangeSelected = !this.isRangeSelected;

    if (this.isRangeSelected) {
      if (this.isRangeSelected) {
        const test = this.memoryForm.get('memory_date');
        if (test) {
          test.setValue(null)
        }
      if (this.datepicker) {
        this.datepicker.close();
      }
    } else {
      const memoryDateRangeControl = this.memoryForm.get('memory_date_range');
      if (memoryDateRangeControl) {
        memoryDateRangeControl.setValue({ start: null, end: null });
      }
      if (this.rangePicker) {
        this.rangePicker.close();
      }
    }
  }
}
}
