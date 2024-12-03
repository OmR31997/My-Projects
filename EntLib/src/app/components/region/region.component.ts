import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../Models/movie.model';
import { Show } from '../../Models/show.model';
import { ShowService } from '../../services/show.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.css'] // Fixed styleUrls typo
})
export class RegionComponent implements OnInit
{
    //Search Variables
  searchQuery:string ='';
  filteredItems: (Movie | Show)[] = [];

  regions: Set<string> = new Set();
  entType='';
  shows: Show[]=[];
  movies: Movie[]=[];
  Genr!: string;

  initalVisibleItems:{[region: string]: number}={};
  currentIndex: { [region: string]: number } = {};
  smoothTransition = true; 
  itemWidth = 310; // Width of each item + margin
  autoSlideInterval: any;

  constructor(private a_route:ActivatedRoute, private route:Router, private movieService:MovieService, private showService:ShowService, private sharedService:SharedService){}
  
  ngOnInit(): void 
  {
    // Access query parameter 'search' using ActivatedRoute
    this.a_route.queryParams.subscribe(params => 
    {
      this.searchQuery = params['search'] || '';  // Default to empty if not provided
      this.filterItems();  // Call your filter function after query change
    });
    
    this.a_route.params.subscribe(params => this.Genr = params['category'])
    //this.sharedService.data$.subscribe(res => this.Genr = res.Genr);
    this.determineEntType();
    
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    this.stopAutoSlide();
  }

  startAutoSlide(region:string): void {
    this.autoSlideInterval = setInterval(() => {
      this.slideNext(region);
    }, 3000); // Change slide every 3 seconds
  }

  stopAutoSlide()
  {
    clearInterval(this.autoSlideInterval);
  }
  
  slidePrev(region: string) 
  {
    if (this.currentIndex[region] > 0) 
    {
      this.currentIndex[region]--;
    } 
    else 
    {
      this.currentIndex[region] = this.getEntertaimentList(region).length - 1; // Reset to last visible items
    }
  }
  
  slideNext(region: string) 
  {
    if (this.currentIndex[region] < this.getEntertaimentList(region).length - 1) 
    {
      this.currentIndex[region]++;
    } 
    else 
    {
      this.currentIndex[region] = 0; // Reset to the first item
    }
  }
  

  determineEntType():void
  {
    if(this.route.url.includes('/movies'))
    {
      if (this.Genr) 
      {
        if (
            ['action', 'adventurer', 'animation', 'comedy', 'sci-Fi', 'suspense', 'superhero']
            .includes(this.Genr.toLowerCase())
           ) 
        {
          this.entType = `Cinema: ${this.Genr.charAt(0).toUpperCase()}${this.Genr.slice(1)}`;
        } 
        else 
        {
          this.route.navigate(['/not-found']);
        }
      }
      else
      {
        this.entType="Movies";
      }
      this.getMovies();
    }
    else if (this.route.url.includes('/shows'))
    {
      if (this.Genr) {
        if(
            ['action', 'adventurer', 'animation', 'comedy', 'sci-Fi', 'suspense', 'superhero']
            .includes(this.Genr.toLowerCase())
          ) 
          {
            this.entType = `${this.Genr.charAt(0).toUpperCase()}${this.Genr.slice(1)} Shows`;
          } 
        else 
        {
          this.route.navigate(['/not-found']);
        }
      } 
      else 
      {
        this.entType = 'Shows';
      }
      this.getShows();
    }
  }
  
  getMovies()
  {
    this.movieService.getMovies().subscribe(
      (resMovies: Movie[]) => 
      {
        this.movies = resMovies;
        this.getRegion(this.movies);
        // Initialize current index for each region
        this.regions.forEach(region => 
        {
          this.startAutoSlide(region);
          this.currentIndex[region] = 1;
          this.initalVisibleItems[region] = this.movies.length;
        });
      },
      error => {
        console.error('Error fetching movies:', error);
      }
    );
  }

  getRegion(entertaiment: (Movie|Show)[])
  {
    if(Array.isArray(entertaiment))
    {
      entertaiment.forEach(ent =>
      {
        if(ent.location)
        {
          this.regions.add(ent.location);
        }
      });
    }
    else
    {
      console.error('Expected movies to be an array', entertaiment);
    }
  }

  getShows():void
  {
    this.showService.getShows().subscribe(
      (resShows: Show[]) => 
      {
        this.shows = resShows;
        this.getRegion(this.shows);
        // Initialize current index for each region
        this.regions.forEach(region => 
        {
          this.startAutoSlide(region);
          this.currentIndex[region] = 1;
          this.initalVisibleItems[region] = this.shows.length;
        });
      },
      error => {
        console.error('Error fetching movies:', error);
      }
    );
  }

  getEntertaimentList(region:string): (Movie | Show)[]
  {
    switch(this.route.url)
    {
      case "/moviess":
        return this.movies.filter(movie => movie.location === region);
      case "/movies":
        return this.movies.filter(movie => movie.location === region);
      case "/shows":
        return this.shows.filter(show => show.location === region);
      case `/movies/${this.Genr}`:
        return this.movies.filter(movie => movie.location === region && movie.category.includes(this.Genr.charAt(0).toUpperCase() + this.Genr.slice(1)));
      case `/shows/${this.Genr}`:
        return this.shows.filter(show => show.location === region && show.category.includes(this.Genr.charAt(0).toUpperCase() + this.Genr.slice(1)));
      default:
        return []
    }
  }

  getVisibleEntertaiment(region:string)
  {
    const startIndex = this.currentIndex[region];
    return this.getEntertaimentList(region).slice(startIndex, startIndex + 4);
  }

  goDetail(ent:Movie|Show)
  {
    if(this.route.url === "/shows" || this.route.url ===`/shows/${this.Genr}` || this.route.url.includes('show'))
      {
        this.route.navigate([`show/${ent.id}`]);
      }
      else if(this.route.url === "/movies" || this.route.url ===`/movies/${this.Genr}` || this.route.url.includes('movie'))
      {
        this.route.navigate([`movie/${ent.id}`]);
      }
      this.sharedService.updateEntDetail(ent)
  }



  filterItems() {
    this.filteredItems = [
      ...this.filterBySearch(this.shows, ['id', 'title', 'showType', 'language', 'session', 'category', 'period', 'location', 'director', 'producer', 'cast', 'description', 'rating', 'posterUrl', 'trailerUrl', 'imdb']),
      ...this.filterBySearch(this.movies, ['id', 'title', 'category', 'language', 'releaseDate', 'location', 'director', 'producer', 'cast', 'description', 'rating', 'posterUrl', 'trailerUrl', 'imdb'])
    ];
  }

  // Helper function to filter items by search query
  filterBySearch(items: (Movie | Show)[], properties: string[]) 
  {
    return items.filter(item => 
    {
      // Check if any of the specified properties contains the search query
      return properties.some(property => 
      (item[property as keyof (Movie | Show)]?.toString().toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    });
  }
}