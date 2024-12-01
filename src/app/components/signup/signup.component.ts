import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserRecord } from '../../Models/user.model';
import { AuthService } from '../../services/auth.service';
import firebase from 'firebase/compat/app';
import { environment } from '../../../environments/environment';
import 'firebase/compat/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']  // Correct 'styleUrl' to 'styleUrls'
})
export class SignupComponent implements OnInit 
{
  userReg!: FormGroup;
  phoneNumberPlaceholder: string = '';
  countries:{[key:string]:{ code: string, pattern: string, placeholder: string }} =
  { 
    'in':{code: '+91', pattern:'^[6-9]\\d{9}$', placeholder:'Enter 10-digit number'}, 
    'jp':{code: '+81', pattern:'^[0-9]\\d{9}$', placeholder:'Enter 10-digit number'}, 
    'rs':{code: '+7', pattern:'^[0-9]\\d{9}$', placeholder:'Enter 10-digit number'}, 
    'de':{code: '+49', pattern:'^[0-9]\\d{9,10}$', placeholder:'Enter 10-11 digits'}, 
    'us':{code: '+1', pattern:'^[0-9]\\d{9}$', placeholder:'Enter 10-digit number'}, 
    'gb':{code: '+44', pattern:'^[0-9]\\d{9,10}$', placeholder:'Enter 10-11 digits'}
  };
  otp:string='';
  verificationId:string='';
  recaptchaVerifier!:firebase.auth.RecaptchaVerifier;
  errorMessage: string = '';
  successMessage: string ='';

  constructor(private userService: UserService, private authService:AuthService) 
  {
    
  }

  ngOnInit(): void 
  {
    this.UserValidation();
    this.initializeRecaptcha();
    this.updatePhoneNumberValidation('in');
  }

  initializeRecaptcha() {
    if (!firebase.apps.length) {
      firebase.initializeApp(environment.firebaseConfig); // Initialize Firebase if not already initialized
    }
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    });
  }

  UserValidation() {
    this.userReg = new FormGroup({
      fName: new FormControl('', [Validators.required]),
      lName: new FormControl('', [Validators.required]),
      country: new FormControl('in', [Validators.required]),
      mno: new FormControl('', [Validators.required,  Validators.pattern('')]),
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$')]),  // Adding email validator
      psw: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern('^[A-Z]{1,}[a-z]+[@$]{1}[0-9]{2,}[A-Za-z]{0,}$')]),  // Adding password length validator
      cPsw: new FormControl('', [Validators.required])
    });
  }

  onInput(event: Event) {
    const input = <HTMLInputElement>event.target;
    input.value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  }

  
  onCountryChange(event: any) {
    const selectedCountry = event.target.value;
    this.updatePhoneNumberValidation(selectedCountry);
  }

  valueChages()
  {
    this.userReg.valueChanges.subscribe((res:any)=> 
    {
      if(res.psw !== res.cPsw)
      {
        this.errorMessage = "Password does not match. Please enter the correct password.."
      }
      else
      this.errorMessage ='';
    });
  }

  updatePhoneNumberValidation(countryCode: string)
  {
    const country = this.countries[countryCode];
    this.phoneNumberPlaceholder = country.placeholder;
    this.userReg.get('mno')?.setValidators([Validators.required, Validators.pattern(country.pattern)]);
    this.userReg.get('mno')?.updateValueAndValidity();
  }

  onSendOtp()
  {
    const phoneNumber = `+91${this.userReg.value.mno}`;
    this.authService.verifyPhoneNumber(phoneNumber, this.recaptchaVerifier)
    .then(confirmationResult => {this.verificationId = confirmationResult.verificationId;
    this.successMessage = "OTP Sent";
    this.errorMessage = "";
    }).catch(error => console.log("Error during OTP send", error));
  }

  onVerifyOtp()
  {
    if(this.verificationId && this.otp)
    {
      const result = this.authService.confirmVericationCode(this.verificationId, this.otp);
      console.log(result);
    }
  }


  onSubmit(userReg: FormGroup) 
  {
    if (userReg.valid) 
    {
      const countryCode = this.userReg.get('country')?.value;
      const newUser = 
      {
        userName: userReg.value.fName + userReg.value.lName,
        email: userReg.value.email,
        password: userReg.value.psw,
        mNo: this.countries[countryCode].code+userReg.value.mno,
        created: new Date().toISOString()
      };
      this.authService.register(newUser.email, newUser.password).then(() => 
      {
        this.userService.userGet(newUser.email).subscribe((res:UserRecord|null) =>
        {
          if(res !== null)
          {
            this.errorMessage = `This email ${newUser.email} has neen already used by someone`;
          }
          else
            this.errorMessage = "";
        }, 
        HttpErrorResponse => 
        {
          if(HttpErrorResponse.status === 404)
          {
            this.userService.userPost(newUser).subscribe(res => 
            {
              if(res)
              {
                this.successMessage = "Welcome As Part Of Our Family Now"
                this.errorMessage ='';
              }
            });
          }
        });  
      }).catch(() => 
      {
        this.errorMessage ='The email Has Been Taken By Someone, Please Put Another Valid Email';
        this.successMessage ='';
      });
    } 
    else 
    {
      this.userReg.markAllAsTouched();  // Marks all fields as touched to display validation errors
      
    }
  }
}
