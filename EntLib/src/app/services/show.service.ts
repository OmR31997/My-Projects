import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Show } from '../Models/show.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShowService {

  apiUrl=`${environment.entertaiment.showApiUrl}`;
  constructor(private hClient:HttpClient) 
  {
    this.getShows();
  }

  getShows():Observable<Show[]>
  {
    return this.hClient.get<Show[]>(this.apiUrl);
  }

  getShow(id:string):Observable<Show>
  {
    return this.hClient.get<Show>(`${this.apiUrl}/${id}`);
  }
}
