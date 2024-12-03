import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRecord } from '../Models/user.model';
import { Movie } from '../Models/movie.model';
import { Show } from '../Models/show.model';

interface GenreData {
  Genr: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService 
{
  // Initialize with a default value

  private entSource = new BehaviorSubject<Movie|Show|null>(null);
  ent$: Observable<Movie | Show | null>  = this.entSource.asObservable(); // Renamed to follow convention

  updateEntDetail(ent: Movie|Show|null) 
  {
    this.entSource.next(ent);
  }
  
  private dataSource = new BehaviorSubject<GenreData>({ Genr: '' });
  data$ = this.dataSource.asObservable(); // Renamed to follow convention

  updateData(data: GenreData) 
  {
    this.dataSource.next(data);
  }

  private userSubject = new BehaviorSubject<UserRecord|undefined>(undefined); // Managing the user state
  user$: Observable<UserRecord|undefined> = this.userSubject.asObservable(); // Observable for user data

  updateUser(user:UserRecord|undefined)
  {
    this.userSubject.next(user);
  }
}
