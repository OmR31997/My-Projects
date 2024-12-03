import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit 
{
  Movies: any[] = [];
  currentIndex = 0; // Start at index 0
  initialVisibleItems = 4; // Number of items to show initially
  nextItemsCount = 4; // Number of items to show on each next click

  constructor(private movieService: MovieService) {
    this.getMovie();
  }

  ngOnInit(): void {}

  getMovie() 
  {
    this.movieService.getMovies().subscribe((resMovies: any) => this.Movies = resMovies);
  }

  getVisibleMovies() {
    return this.Movies.slice(this.currentIndex, this.currentIndex + this.getCurrentVisibleCount());
  }

  getCurrentVisibleCount() {
    return this.currentIndex === 0 ? this.initialVisibleItems : this.nextItemsCount; // Show 4 initially, then 5
  }

  slideNext() {
    const newIndex = this.currentIndex + this.getCurrentVisibleCount();
    if (newIndex < this.Movies.length) {
      this.currentIndex = newIndex; // Move to next items
    }
  }

  slidePrev() {
    const newIndex = this.currentIndex - this.nextItemsCount;
    if (newIndex >= 0) {
      this.currentIndex = newIndex; // Move back in increments of nextItemsCount
    }
  }
}
