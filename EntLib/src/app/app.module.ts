import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { CategoryComponent } from './components/category/category.component';
import { EntertaimentDetailComponent } from './components/entertaiment-detail/entertaiment-detail.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RegionComponent } from './components/region/region.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { CustomCountryPipe } from './pipes/custom-country.pipe';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthService } from './services/auth.service';
import { LoadingInterceptor } from './interceptor/loading.interceptor';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    CategoryComponent,
    EntertaimentDetailComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    LoadingComponent,
    NotFoundComponent,
    RegionComponent,
    SigninComponent,
    SignupComponent,
    UserprofileComponent,
    CustomCountryPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    ReactiveFormsModule,
  ],
  providers: [AuthService, { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }, {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule 
{ 
  constructor()
  {
    // Initialize Firebase with the config from the environment file
    const app = initializeApp(environment.firebaseConfig);

     // Initialize Authentication
    const auth = getAuth(app);

     if (environment.production) 
    {  // Only enable analytics in production
      const analytics = getAnalytics(app);
      console.log('Analytics initialized in production');
    }
  }
}
