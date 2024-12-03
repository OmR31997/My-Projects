import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { FeedBack, wFeedType } from '../Models/feed.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService implements OnInit {

  feed!:wFeedType
  FeedAPI = `${environment.entertaiment.feedBApiUrl}`;

  constructor(private hClient: HttpClient) { }

  ngOnInit(): void {
    this.getFeedBacks();
  }

  deleteComment(delFeed: wFeedType)
  { 
    this.hClient.delete<string>(`${this.FeedAPI}/${delFeed.feedId}/Comment/${delFeed.cmtId}`).subscribe((res:string) => console.log(res)); 
  }

  // Get all feedback
  getFeedBacks(): Observable<FeedBack[]> {
    return this.hClient.get<FeedBack[]>(this.FeedAPI);
  }

  // Get feedback by ID
  getFeedbackByEntId(entId: string): Observable<FeedBack[]> {
    return this.hClient.get<FeedBack[]>(`${this.FeedAPI}/${entId}`);
  }

  
  // Post new feedback
  postFeedBack(newFeed:wFeedType): Observable<FeedBack> 
  {
    return this.hClient.post<FeedBack>(`${this.FeedAPI}/${newFeed.entId}/${newFeed.email}`, newFeed);
  }

  // Patch feedback with specific fields (Like, Comment, or Rating)
  patchFeedBack(updfeed:wFeedType): Observable<any> 
  {
    
    if (updfeed.feedId !== undefined) 
    {
      if (updfeed.like !== undefined) 
      {
        // Patch request for 'Like' feedback
        const url = `${this.FeedAPI}/${updfeed.feedId}/Like`; 
        return this.hClient.patch(url, updfeed.like);
      }
      
      if(updfeed.cmtId !== undefined)
      {
        const url = `${this.FeedAPI}/${updfeed.feedId}/Comment/${updfeed.cmtId}`;
        
        return this.hClient.patch(url, updfeed.comment);
      }
      if (updfeed.rating !== undefined) 
      {
        const url = `${this.FeedAPI}/${updfeed.feedId}/Rating`;
        return this.hClient.patch(url, updfeed.rating);
      }
    }
    // Return observable if no conditions met
    return of(null);
  }
  
}
