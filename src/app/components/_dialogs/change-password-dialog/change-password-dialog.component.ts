import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";


@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {
  @Output() updateUserPassword = new EventEmitter<any>();
  changePasswordForm: FormGroup;
  currentUser: any;


  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private afAuth: AngularFireAuth
  ) {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null;
      }
    });
  }

  submitPassword() {
    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    console.log(this.currentUser.email, newPassword, currentPassword);

    this.currentUser.reauthenticateWithCredential(this.currentUser.email, currentPassword)
      .then(() => {
        this.currentUser.updatePassword(newPassword)
          .then(() => {
            console.log('Password updated successfully');
            // Password updated successfully, handle success
          })
          .catch((error: any) => {
            console.error('Error updating password:', error);
            // Handle error updating password
          });
      })
      .catch((error: any) => {
        console.error('Error reauthenticating user:', error);
        // Handle error reauthenticating user
      });
    this.dialogRef.close();
  }

  changePassword() {
    const auth = getAuth();

    const user = auth.currentUser;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const credential = this.changePasswordForm.get('currentPassword')?.value;

    if (user && credential) {
      updatePassword(user, newPassword).then(() => {
        // Update successful.
        console.log("Password set to:", newPassword);
      }).catch((error) => {
        reauthenticateWithCredential(user, credential).then(() => {
          updatePassword(user, newPassword).then(() => {
            // Update successful.
            console.log("Password set to:", newPassword);
          }).catch((error) => {
            // An error ocurred
            // ...
          });
        });
      });
    }
  }


  closeDialog() {
    this.dialogRef.close();
  }
}
