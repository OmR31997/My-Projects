import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { map, Observable } from 'rxjs';

export const userGuard: CanActivateFn = (route, state): Observable<boolean> => 
{
  const user = inject(SharedService);
  const router = inject(Router)
  
  const userIdFromRoute = route.paramMap.get('id'); 
  if (userIdFromRoute) {
    console.log('User ID from route:', userIdFromRoute);
  }

  const currentUrl = state.url;  // The full URL of the navigation
  const queryParams = route.queryParams;  // Get query params from the current route

  console.log('Current URL:', currentUrl);
  console.log('Query Params:', queryParams);
  
  return user.user$.pipe(map(res =>
  {
    if(res)
    {
      return true;
    }
    else
    {
      router.navigate(['/signIn']);
      return false;
    }
  })
  );
};
