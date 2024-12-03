import { Component, OnInit } from '@angular/core';
import { UserRecord, UserUpdate } from '../../Models/user.model';
import { SharedService } from '../../services/shared.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { catchError, of } from 'rxjs';
//import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent implements OnInit
{
  updateReq!:FormGroup;
  userDetails!:UserRecord;
  updateUser!:UserUpdate;
  phoneNumberPlaceholder: string = '';
  errorMessage =''
  successMessage =''
  countries:{[key:string]:{ code: string, pattern: string, placeholder: string }} =
  { 
    'in':{code: '+91', pattern:'^[6-9]\\d{9}$', placeholder:'Enter 10-digit number'}, 
    'jp':{code: '+81', pattern:'^[0-9]{10}$', placeholder:'Enter 10-digit number'}, 
    'rs':{code: '+7', pattern:'^[0-9]{10}$', placeholder:'Enter 10-digit number'}, 
    'de':{code: '+49', pattern:'^[0-9]{10,11}$', placeholder:'Enter 10-11 digits'}, 
    'us':{code: '+1', pattern:'^[0-9]{10}$', placeholder:'Enter 10-digit number'}, 
    'gb':{code: '+44', pattern:'^[0-9]{10,11}$', placeholder:'Enter 10-11 digits'}
  };

  constructor(private sharedService:SharedService, private userService:UserService, private authService:AuthService){}
  

  isEditingUserName: boolean = false;
  isEditingMobile: boolean = false;
  isEditingEmail: boolean = false;
  isEditingPassword: boolean = false;
  isEditingWatchList: boolean = false;
  showPassword: boolean = false;

  UserValidation()
  {
    if(this.userDetails)
    {
      this.updateReq = new FormGroup
      ({
        userId: new FormControl(this.userDetails.userId||'', [Validators.required]),
        userName: new FormControl(this.userDetails.userName||'', [Validators.required]),
        country: new FormControl('in', [Validators.required]),
        mobileNo: new FormControl('', [Validators.required, Validators.pattern('')]),
        userEmail: new FormControl(this.userDetails.email||'', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$')]),
        userPsw: new FormControl(this.userDetails.password||'', [Validators.required, Validators.pattern('^[A-Z]{1,}[a-z]+[@$]{1}[0-9]{2,}[A-Za-z]{0,}$'), Validators.minLength(6)]),
        watchList: new FormArray(this.userDetails.watchList?.map(item => this.createWatchListItem(item)) || []),
      });
    }
  }

  createWatchListItem(item: { watchId: number, entId: string, entTitle: string }): FormGroup {
    return new FormGroup({
      entId: new FormControl(item.entId, [Validators.required]), // entId as FormControl
      entTitle: new FormControl(item.entTitle, [Validators.required]) // entTitle as FormControl
    });
  }

  onCountryChange(event: any) {
    const selectedCountry = event.target.value;
    this.updatePhoneNumberValidation(selectedCountry);
  }

  onInput(event: Event) {
    const input = <HTMLInputElement>event.target;
    input.value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  }

  updatePhoneNumberValidation(countryCode: string)
  {
    const country = this.countries[countryCode];
    this.phoneNumberPlaceholder = country.placeholder;
    this.updateReq.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(country.pattern)]);
    this.updateReq.get('mobileNo')?.updateValueAndValidity();
  }

  ngOnInit(): void 
  {
    this.sharedService.user$.subscribe(res => 
    {
      if(res)
      {
        this.userDetails = 
        {
          userId:res.userId,
          userName:res.userName,
          email:res.email,
          password:res.password,
          mNo:res.mNo,
          watchList: res.watchList,
          created:res.created
        }
      }
    });

    this.UserValidation();
    this.updatePhoneNumberValidation('in')
  }

  toggleEdit(field: string) {
    switch (field) {
      case 'userName':
        this.isEditingUserName = !this.isEditingUserName;
        break;
      case 'mobile':
        this.isEditingMobile = !this.isEditingMobile;
        break;
      case 'email':
        this.isEditingEmail = !this.isEditingEmail;
        break;
      case 'password':
      {
        if(this.isEditingPassword)
        {
          const passControl = this.updateReq.get('userPsw');
          if(passControl?.valid && passControl.value.userPsw != '')
          {
            passControl.markAllAsTouched();
            passControl.updateValueAndValidity();
            this.authService.updatePassword(this.updateReq.value.userPsw)
            .pipe(catchError(error => {return of (null)}))
            .subscribe(() =>
            {
              this.errorMessage ='';
              this.successMessage = 'Password updated successfully'
            });
            const userLog = {emailOrMobile: this.userDetails.email, password:this.updateReq.value.userPsw}
            this.userService.userSign(userLog).subscribe(res => 
            {
              if(res)
              {
                alert("Password Approved");
              }
            });
            return
          }
          else if ( this.updateReq.value.userPsw != "")
          {
            this.errorMessage = 'Password Invalid';
            this.successMessage ='';
            return;
          }
        }
        
        if(this.userDetails.password ==='Pending')
        {
          this.isEditingPassword = true;
        }
        
        if(!this.isEditingPassword)
        {
          if(this.userDetails.password === 'HasPassword')
          {
            let inputPassword = prompt("Please Enter Your Password");
            if(inputPassword)
            {
              this.userService.userGetUserThroughId(this.updateReq.value.userId, inputPassword).subscribe((res:boolean) => 
              {
                if(res === true)
                {  
                  this.errorMessage ='';
                  this.successMessage = "Password Matched"
                  
                  this.isEditingPassword = res;
                }
                else if(res === false)
                {
                  this.successMessage ='';
                  this.errorMessage = "Password Incorrect Please Try Correct"
                }
              });
            }
          }
        }
      }
      break;
      case 'watchList':
      this.isEditingWatchList = !this.isEditingWatchList;  
        
      break;
    }
  }

  get userPsw()
  {
    return this.updateReq.get("userPsw")
  }

  newPass()
  {
    const pswControl = this.updateReq.get("userPsw");
    if(pswControl)
    {
      pswControl.markAllAsTouched();
      pswControl.updateValueAndValidity()
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(updateReq:FormGroup)
  {
    if(updateReq.valid)
    {
      const countryCode = this.updateReq.get('country')?.value;

      this.updateUser =
      {
        userId:updateReq.value.userId,
        userName:updateReq.value.userName,
        email:updateReq.value.userEmail,
        mNo:this.countries[countryCode].code+updateReq.value.mobileNo,
        watchList:updateReq.value.watchList,
        created:String(new Date().toISOString())
      }
      this.userDetails =
      {
        userId:updateReq.value.userId,
        userName:updateReq.value.userName,
        email:updateReq.value.userEmail,
        password:this.userDetails.password,
        mNo:updateReq.value.mobileNo,
        watchList:updateReq.value.watchList,
        created:String(new Date().toISOString())
      }
      this.sharedService.updateUser(this.userDetails);
      this.userService.userPut(this.updateUser).subscribe(res => 
      {
        if(res)
        {
          this.successMessage = "Please Wait...";
          this.errorMessage = "";
        }
      })
    }
    else
    {
      this.updateReq.markAllAsTouched();
    }
  }

  deleteWatch(i:number)
  {
    if(this.userDetails.watchList)
    {
      if(i !== -1)
      {
        this.userDetails.watchList.splice(i, 1);
      }
    }
  }
}
