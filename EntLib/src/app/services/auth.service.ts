import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { environment } from '../../environments/environment';
import { UserRecord } from '../Models/user.model';
import { SharedService } from './shared.service';
import { UserService } from './user.service';
import { getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import { from, Observable } from 'rxjs';

import { switchMap, catchError } from 'rxjs/operators'; // Import operators from RxJS

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userDetails!: UserRecord;
  UserAPI = `${environment.entertaiment.userApiUrl}`; // User API URL

  constructor(private userService: UserService, private afAuth: AngularFireAuth, private sharedService: SharedService) {
    
  }

  // Google sign-in
  async gSignIn(): Promise<boolean> 
  {
    try 
    {
      const auth = getAuth();  // Get the auth instance
      const provider = new GoogleAuthProvider(); 
      const result = await signInWithPopup(auth, provider); 
      //const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      const user = result.user;
      if(user)
      {
        if(user.email !== null)
        {
          this.userService.userGet(user.email).subscribe((res:any) => 
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
          },
          HttpErrorResponse => 
          {
            if(HttpErrorResponse.status === 404)
            {
              if(user.displayName !== null && user.email)
              {
                const newUser = 
                {
                  userName:user.displayName,
                  mNo:user.phoneNumber,
                  email:user.email,
                  password:null,
                  created: new Date().toISOString()
                }
                this.userService.userPost(newUser).subscribe(res => 
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
                });
              }
            }
          })
        }
      }
      return true;
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      return false;
    }
  }

  // Register a new user with email and password
  register(email: string, password: string): Promise<firebase.auth.UserCredential>
  {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Log in with email and password
  login(email: string, password: string): Promise<firebase.auth.UserCredential> 
  { 
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

   // Update password method
  updatePassword(newPassword: string): Observable<void> {
   return from(this.afAuth.currentUser).pipe(
     switchMap((user) => {
       // Check if the user is logged in
       if (user) {
         // Cast user to FirebaseUser type
         return from((user as firebase.User).updatePassword(newPassword)); // Now it's properly typed
       } else {
         throw new Error('No user is logged in');
       }
     }),
     catchError((error) => {
       // Handle error here if needed
       throw error;
     })
   );
  }
  sendPasswordResetEmail(email: string):Promise<void>
  {
    return this.afAuth.sendPasswordResetEmail(email)
    // .then(() => {'Password reset email sent';})
    // .catch(() => 'Error sending password reset email');
  }
  //Here, Below this block for initiate phone number Verification
  verifyPhoneNumber(phoneNum:string, recaptchaVerifier:firebase.auth.RecaptchaVerifier)
  {
    const appVerifier = recaptchaVerifier;
    return this.afAuth.signInWithPhoneNumber(phoneNum, appVerifier);
  }

  //Here, Below this block for Confirm OTP
  confirmVericationCode(verificationId:string, otp:string)
  {
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
    return this.afAuth.signInWithCredential(credential)
    .then(result => {console.log("Phone number verified", result);}).catch(error => console.log("Error during OTP verification", error));
  }
  
  // Facebook sign-in
  async fSignIn(): Promise<void> {
    try {
      await this.afAuth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
      console.log('Facebook sign-in successful');
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
    }
  }

  // Sign out the user
  async signOut(): Promise<void> {
    try 
    {
      await this.afAuth.signOut();

      // Clear the user observable
      
      this.sharedService.updateUser(undefined);

      console.log('Sign-out successful');
    } 
    catch (error) 
    {
      console.error('Error during sign-out:', error);
    }
  }

  // Get current user information
  getUserInfo() {
    return this.afAuth.currentUser;
  }

  getUser()
  {
    return this.afAuth.authState
  }
}
