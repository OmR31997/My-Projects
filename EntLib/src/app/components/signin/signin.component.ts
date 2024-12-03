import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UserRecord } from '../../Models/user.model';
import { SharedService } from '../../services/shared.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent implements OnInit
{
  loading=true;
  isLoading$ = this.loadService.loading$;
  userDetails!:UserRecord;
  userReq!:FormGroup;
  isReg!:boolean;
  isLog!:boolean;
  errorMessage: string = '';
  successMessage: string ='';
  constructor(private loadService:LoadingService, private userService:UserService, private authService:AuthService, private route:Router, private sharedService:SharedService){}

  ngOnInit(): void 
  {
    if(this.route.url==="/signIn")
    {
      this.isReg=false;
      this.isLog=true

      this.UserValidation();
    }
    else if(this.route.url==="/signUp")
    {
      this.isReg=true;
      this.isLog=false;
    }
  }

  Reg()
  {
    this.route.navigate(["signUp"])
  }

  UserValidation()
  {
    this.userReq = new FormGroup
    ({
      emailOrMobile: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required])
    })
  }

  onSubmit(userReq:FormGroup)
  {
    if(userReq.valid)
    {
      this.userService.userGetEmail(userReq.value.emailOrMobile).subscribe((res:any) => 
      {
        if(res.email !== '')
        {
          userReq.value.emailOrMobile = res.email;
        }

        this.authService.login(userReq.value.emailOrMobile, userReq.value.password)
        .then(() =>
        {
          this.userService.userSign(userReq.value).subscribe(res => 
            {
              if(res)
              {
                this.userDetails = 
                {
                  userId:res.userId,
                  userName:res.userName,
                  mNo:res.mNo,
                  email:res.email,
                  password: res.password,
                  watchList: res.watchList,
                  created: res.created
                }
                this.sharedService.updateUser(this.userDetails);
                this.successMessage = "Sucessefully Authenticated"
                this.errorMessage = '';
              }
            });
        })
        .catch(() => 
        {
          this.errorMessage = "Please enter a valid mobile number (with country code) and password, or an email address and password.";
          this.successMessage ='';
        });
      });
    }
    else
    {
      this.userReq.markAllAsTouched();
    }
  }

  GSignIn()
  {
    this.authService.gSignIn().then(success => 
    {
      if(success)
      {
        this.successMessage = "Sucessefully Authenticated"
        this.errorMessage = '';
      }
      else
      {
        this.successMessage ='';
        this.errorMessage="Sign-in was not successful."
      }

    })
    .catch(error => {
      console.error('Sign in failed: ', error);
    });
  }

  FSignIn()
  {
    this.authService.fSignIn().then(() =>
    {
      this.route.navigate(['']);
    })
    .catch(error => 
    {
      console.error('Sign in failed: ', error);
    });
  }

  forgot()
  {
    let getEmail = prompt("Please Enter Your Email: ");
    
    if(getEmail !== null)
    {
      this.authService.sendPasswordResetEmail(getEmail)
      .then(() =>
      {
        this.successMessage = 'Password reset email has been sent. Please check your inbox.';
        this.errorMessage = '';
      });
    }
    
  }

}
