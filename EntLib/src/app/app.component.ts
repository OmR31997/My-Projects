import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent 
{
  searchQuery: string = '';
  title = 'MovieLib';

  constructor(private router: Router){}
   // When searchQuery changes in app-header, navigate with query parameter
   onSearchQueryChange(query: string): void {
    this.searchQuery = query;
  
    // Navigate with the new query parameter
    this.router.navigate([], {
      queryParams: { search: query },
      queryParamsHandling: 'merge',  // Merge with existing query params
    });
  }
  
}
