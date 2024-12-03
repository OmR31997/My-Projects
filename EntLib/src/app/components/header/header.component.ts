import { Component, EventEmitter, OnInit, Output, Renderer2 } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';
import { UserRecord } from '../../Models/user.model';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit
{
  searchQuery: string = '';  // Bind this to the input field
  @Output() searchQueryChanged = new EventEmitter<string>();

  useremail=false
  userDetails:UserRecord|undefined=undefined;
  constructor(private route:Router, private renderer: Renderer2, private authService:AuthService, private sharedService:SharedService) { }

  ngOnInit(): void 
  {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.renderer.setAttribute(document.documentElement, 'data-theme', savedTheme);

    const userDetailsString = sessionStorage.getItem('userDetails');
    
    if (userDetailsString) {
      const userDetails = JSON.parse(userDetailsString);
      this.userDetails = userDetails;
      this.sharedService.updateUser(this.userDetails);
      console.log('User details retrieved:', userDetails);
    } else {
      console.log('No user details found in session storage.');
    }


    this.sharedService.user$.subscribe(res => 
    {
      if(res)
      {
        this.userDetails =
              {
                userId: res.userId,
                userName: res.userName,
                mNo: res.mNo,
                email: res.email,
                password: res.password,
                watchList: res.watchList,
                created: res.created
              }
        // Save to session storage
        sessionStorage.setItem('userDetails', JSON.stringify(this.userDetails));
        console.log('User details stored in session storage!');
      }
    });
  }
  
  toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.renderer.setAttribute(document.documentElement, 'data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  signOut()
  {
    this.authService.signOut();
    this.userDetails = undefined;
    localStorage.clear();
    sessionStorage.clear();
    this.route.navigate([""]);
    this.sharedService.updateUser(undefined);
  }

  userProfile(userDetails:UserRecord|undefined)
  {
    //this.userService.userGet()

    if(userDetails)
    {
      this.route.navigate([`user-profile//${userDetails?.userId}`])
    }
  }

  onSearchChange() 
  {
    this.searchQueryChanged.emit(this.searchQuery);  // Emit the search query
  }
  
}
