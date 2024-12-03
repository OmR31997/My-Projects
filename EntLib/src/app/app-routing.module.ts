import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { RegionComponent } from './components/region/region.component';
import { EntertaimentDetailComponent } from './components/entertaiment-detail/entertaiment-detail.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { userGuard } from './guards/user.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path:'about', component:AboutComponent },
  {path:'movies', component:RegionComponent},
  {path:'shows', component:RegionComponent},
  
  // Movies and Shows routes with a dynamic category
  { path: 'movies/:category', component: RegionComponent },
  { path: 'shows/:category', component: RegionComponent },
  
  { path: 'movie/:id', component: EntertaimentDetailComponent },
  { path: 'show/:id', component: EntertaimentDetailComponent },
  
  { path: 'signIn', component: SigninComponent },
  { path: 'signUp', component: SignupComponent },
  { path: 'user-profile/:id', component: UserprofileComponent, canActivate: [userGuard] },
  
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' } // Wildcard route for invalid paths

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
