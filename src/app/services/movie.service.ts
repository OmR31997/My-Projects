import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../Models/movie.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService 
{
  apiUrl= `${environment.entertaiment.movieApiUrl}`;
  constructor(private hClient:HttpClient) 
  {
   
  }

  getMovies():Observable<Movie[]>
  {
    return this.hClient.get<Movie[]>(this.apiUrl);
  }

  getMovie(id:string):Observable<Movie>
  {
    return this.hClient.get<Movie>(`${this.apiUrl}/${id}`);
  }
  
}
