import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest, UserRecord, UserUpdate } from '../Models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit
{

  UserAPI = `${environment.entertaiment.userApiUrl}`;
  constructor(private hClient:HttpClient) { }

  ngOnInit(): void 
  {
    
  }

  usersGet():Observable<UserRecord[]>
  {
    return this.hClient.get<UserRecord[]>(`${this.UserAPI}/users`);
  }
  userGet(email:string):Observable<UserRecord>
  {
    return this.hClient.get<UserRecord>(`${this.UserAPI}/user/E-${email}`);
  }

  userGetEmail(mNo:string):Observable<string>
  {
    return this.hClient.get<string>(`${this.UserAPI}/user/M-${mNo}`);
  }

  userSign(loginData:LoginRequest):Observable<UserRecord>
  {
    return this.hClient.post<UserRecord>(`${this.UserAPI}/login`, loginData);
  }

  userPost(newUser:{userName:string, email:string, password:string|null, mNo:string|null, created:string}):Observable<UserRecord>
  {
    return this.hClient.post<UserRecord>(`${this.UserAPI}/user`, newUser);
  }

  userWatchListEdit(userId:string, fav:{watchId:number, entId:string, entTitle:string}):Observable<any>
  {
    const url = `${this.UserAPI}/user/${userId}/WatchList/${fav.watchId}`;
    const favEnt = {entId:fav.entId, entTitle:fav.entTitle}
    return this.hClient.patch(url, favEnt);
  }

  userPut(userDetails:UserUpdate):Observable<any>
  {
    const url = `${this.UserAPI}/user/${userDetails.userId}`;
    userDetails.userId=undefined;

    return this.hClient.put<UserRecord>(url, userDetails);
  }

  userGetUserThroughId(userId:string, userPsw:string):Observable<any>
  {
    return this.hClient.get<boolean>(`${this.UserAPI}/user/U-${userId}/P-${userPsw}`);
  }
}
