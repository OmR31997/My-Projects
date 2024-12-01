import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { MovieService } from '../../services/movie.service';
import { ShowService } from '../../services/show.service';
import { Movie } from '../../Models/movie.model';
import { Show } from '../../Models/show.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit
{
  currentMovieIndex:number = 0;
  currentShowIndex:number = 0;
  movies:Movie[]=[];
  shows:Show[]=[];
  ctg!:string;
  isHide=false;
  Category:string[]=["Action", "Adventurer", "Animation", "Comedy", "Sci-Fi", "Suspense", "Superhero"]
  constructor(private movieService:MovieService, private showService:ShowService, private router:Router, private shareService:SharedService){}

  ngOnInit(): void {
    this.popularMovies();
    this.popularShows();
    setInterval(()=>{this.showNextImages();}, 3000);
  }
  
  getAsk(ctg:string)
  {
    this.isHide = true;
    this.ctg= ctg.toLowerCase();
  }

  ctgEvent(eType:string)
  {
    this.shareService.updateData({Genr:this.ctg})
    this.router.navigate([`${eType}/${this.ctg}`])
  }

  popularMovies()
  {
    this.movieService.getMovies().subscribe((resMovies) => 
    {
      this.movies = resMovies.filter(movie => 
      {
        return Number(movie.rating) >= 8
      }).filter(movie => 
        {
          const extractYear = movie.releaseDate.split('-')[0];
          return Number(extractYear) >= 2020; 
        });
    });
  }

  popularShows()
  {
    this.showService.getShows().subscribe((resShows) => 
      {
        this.shows = resShows.filter(res => 
        {
        // Replace "present" with "2024" if it exists
          const presentYear = res.period.replace("present", "2024");
          
          // Extract the end year from the period string
          const endYearStr = presentYear.slice(5);
          return Number(endYearStr) >= 2020;
        }).filter(show => Number(show.rating) >= 8)
      });
  }

  showNextImages()
  {
    this.currentMovieIndex = (this.currentMovieIndex + 1)%this.movies.length;
    this.currentShowIndex = (this.currentShowIndex + 1)%this.shows.length;
  }

}
