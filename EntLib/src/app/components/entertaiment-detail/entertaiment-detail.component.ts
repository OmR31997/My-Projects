import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Movie } from "../../Models/movie.model";
import { Show } from "../../Models/show.model";
import { SharedService } from "../../services/shared.service";
import { MovieService } from "../../services/movie.service";
import { ShowService } from "../../services/show.service";
import { FeedbackService } from "../../services/feedback.service";
import { UserService } from "../../services/user.service";
import { forkJoin} from "rxjs";
import { UserRecord } from "../../Models/user.model";
import { commentList, wFeedType } from "../../Models/feed.model";

@Component
({
  selector:'app-entertaiment-detail',
  templateUrl:'./entertaiment-detail.component.html',
  styleUrls:['./entertaiment-detail.component.css']
})
export class EntertaimentDetailComponent implements OnInit
{
  //Variables

  //Loading Animation Variable
  loading=true;
  loadingDuration: number = 7000; // Set loading duration in milliseconds

  entDetail: Movie | Show = {} as Movie | Show;
  entType:string='';
  Count={like:0, comment:0, watch:0};
  commentsVisible= false;
  editingIndex: number | null = null;
  commentInputTxt={newCmt:'', editCmt:''}
  cmtList:commentList[]=[];
  shareVisible=false;
  stars: number[] = [1, 2, 3, 4, 5];
  userDetails!:UserRecord|undefined;
  pairUserFeed = {isLike:false, isComment:false, rating:0, isWatch:false, CmtCount:0, feedId:''}
  trackByCmtId(comment: any): string {
    return comment.cmtIds; // Use unique ID for tracking
  }

  wfeed!:wFeedType | undefined;

  constructor
  (
    private route:Router,
    private sharedService:SharedService,
    private a_route:ActivatedRoute,
    private movieService:MovieService,
    private showService:ShowService,
    private feedService:FeedbackService,
    private userService:UserService
  ){}

  ngOnInit(): void 
  {
    // Start loading timeout
    setTimeout(() => {
      this.loading = false; // Set loading to false after 7 seconds
    }, this.loadingDuration);

    this.loadEntertainmentDetail();
    this.getUsersDetail()
    if(this.userDetails !== undefined)
    {
      this.getUserFeed(this.userDetails.email, this.entDetail.id);
    }
  }

  loadEntertainmentDetail()
  {
    this.sharedService.ent$.subscribe((res: Movie | Show | null) => 
    {
      if (this.route.url.includes("movie")) 
      {
        this.entType = "Cinema"
        if (res) 
        {
        // Type narrowing using a check for the releaseDate property
          if ('releaseDate' in res) 
          {
            this.entDetail = 
            {
              id: res.id,
              title: res.title,
              category: res.category,
              language: res.language,
              releaseDate: res.releaseDate,  // Now TypeScript knows this is a Movie
              location: res.location,
              director: res.director,
              producer: res.producer,
              cast: res.cast,
              description: res.description,
              rating: res.rating,
              posterUrl: res.posterUrl,
              trailerUrl: res.trailerUrl,
              imdb: res.imdb
            };

            this.getFeedBacksFromOverall(this.entDetail.id)
          }
        }
        else 
        {
          //This works when user uses directly link
          let entId='';
          this.a_route.params.subscribe(resEntId => entId = resEntId[`id`]);
          this.movieService.getMovie(entId).subscribe((resMovie:Movie) => 
          {
            if(!resMovie)
            {
              this.route.navigate([`not-found`]);
            }
            this.entDetail = 
            {
              id: resMovie.id,
              title: resMovie.title,
              category: resMovie.category,
              language: resMovie.language,
              releaseDate: resMovie.releaseDate,
              location: resMovie.location,
              director: resMovie.director,
              producer: resMovie.producer,
              cast: resMovie.cast,
              description: resMovie.description,
              rating: resMovie.rating,
              posterUrl: resMovie.posterUrl,
              trailerUrl: resMovie.trailerUrl,
              imdb: resMovie.imdb
            }
            this.getFeedBacksFromOverall(this.entDetail.id)
          });
        }
      } 
      else if (this.route.url.includes("show")) 
      {
        this.entType = "Series";
        if (res) 
        {
        // Type narrowing using a check for the releaseDate property
          if ('period' in res) 
          {
            this.entDetail = 
            {
              id: res.id,
              title: res.title,
              showType: res.showType,
              language: res.language,
              session: res.session,
              category:res.category,
              period: res.period,  // Now TypeScript knows this is a Show
              location: res.location,
              director: res.director,
              producer: res.producer,
              cast: res.cast,
              description: res.description,
              rating: res.rating,
              posterUrl: res.posterUrl,
              trailerUrl: res.trailerUrl,
              imdb: res.imdb
            };

            this.getFeedBacksFromOverall(this.entDetail.id)
          }
        }
        else 
        {
          let entId='';
          this.a_route.params.subscribe(resEntId => entId = resEntId[`id`]);
          this.showService.getShow(entId).subscribe((resShow:Show) => 
          {
            if(!resShow)
            {
              this.route.navigate([`not-found`]);
            }
            this.entDetail = 
            {
              id: resShow.id,
              title: resShow.title,
              showType: resShow.showType,
              language: resShow.language,
              session: resShow.session,
              category: resShow.category,
              period: resShow.period,
              location: resShow.location,
              director: resShow.director,
              producer: resShow.producer,
              cast: resShow.cast,
              description: resShow.description,
              rating: resShow.rating,
              posterUrl: resShow.posterUrl,
              trailerUrl: resShow.trailerUrl,
              imdb: resShow.imdb
            }
            this.getFeedBacksFromOverall(this.entDetail.id)
          });
        }
      }
    });
  }

  isShow(entDetail: Movie | Show): entDetail is Show 
  {
    return (entDetail as Show).period !== undefined;
  }

  isMovie(entDetail: Movie | Show): entDetail is Movie 
  {
    return (entDetail as Movie).releaseDate !== undefined;
  }

  getPerRating(): number 
  {
    return (Number(this.entDetail.rating) / 10) * 100;
  }

  getFeedBacksFromOverall(entId: string) 
  {
    let LikeCount = 0;
    let CmtCount = 0;
  
    // Combine both the feedback and watchlist observables
    forkJoin
    ([
      this.feedService.getFeedbackByEntId(entId),  // Observable for feedbacks
      this.userService.usersGet()                   // Observable for users
    ])
    .subscribe(([resFeeds, resUsers]) => 
    {
      // Process feedbacks
      resFeeds.forEach((resFeed: any) => 
      {
        if (resFeed.entId === entId && resFeed.like === true) 
        {
          LikeCount++;
        }
  
        if (resFeed.entId === entId && resFeed.comment) 
        {
          CmtCount += resFeed.comment.length;
          resFeed.comment.forEach((resComment:any) => 
          {
            let comment = 
            {
              entId:entId, 
              emailId:resFeed.email,
              cmtId:resComment.cmtId, 
              txtComment: resComment.txtCmt, 
              dropAt: resComment.dropAt 
            }

            this.cmtList?.push(...[comment]);
          });
        }
      });
      
      // Process watchlist
      let watchCount = 0;
      resUsers.forEach((resUser: any) => 
      {
        const hasEntId = resUser.watchList?.some((item: any) => item.entId === entId);
        if (hasEntId) 
        {
          watchCount++;
        }
      });
  
      // Now that both feedbacks and watchlist have been processed, update Count
      this.Count = 
      {
        like: LikeCount,
        comment: CmtCount,
        watch: watchCount
      };
  
      // You can now use the updated Count object for any other operations
      //console.log(this.Count);  // Or any other operations you need to perform
    });
  }

  getUsersDetail()
  {
    this.sharedService.user$.subscribe((res:UserRecord|undefined) => 
    {
      if(res)
      {
        this.userDetails = 
        {
          userId:res.userId,
          userName:res.userName,
          mNo:res.mNo,
          email:res.email,
          password:res.password,
          watchList:res.watchList,
          created:res.created
        }
      }
    })
  }

  getUserFeed(emailId:string, entId:string)
  {
    let like=false;
    let comment=false; 
    let rnk=0; 
    let watch=false; 
    let Count=0;
    let Id='';

    forkJoin([this.feedService.getFeedbackByEntId(entId),this.userService.userGet(emailId)])
    .subscribe(([resFeeds, resUser]) => 
    {
      resFeeds.find((resFeed:any) => 
      { 
        if(resFeed.email === emailId && resFeed.entId === entId)
        {
          like = resFeed.like==true,
          rnk = resFeed.rating;
          Id = resFeed.fid;
          if(resFeed.comment)
          {
            Count = resFeed.comment.length,
            comment = resFeed.comment.length > 0
          }
        }

        if(resUser.watchList)
        {
          watch = resUser.watchList.some((item:any) => item.entId === entId)
        }

        this.pairUserFeed =
        {
          isLike:like,
          isComment:comment,
          isWatch:watch,
          CmtCount:Count,
          rating:rnk,
          feedId:Id
        }
      });
    });
  }

  toggleComments()
  {
    this.commentsVisible = !this.commentsVisible;
  }

  toggleShare()
  {
    this.shareVisible = !this.shareVisible;
  }

  share(social:string)
  {
    const url = window.location.href;
    var link;
    navigator.clipboard.writeText(url).then(()=> 
    {
      console.log("Page link copied to clipboard!");
    }).catch(error => console.log("Failed to copy the link.",error));

    if(social === 'gmail')
    {
      // Open Gmail with the pre-filled subject and body
      const sbj = encodeURIComponent("About: ReviewZone.com");
      const body = encodeURIComponent(`Hey, I found this link interesting: [${url}]`);
      link = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${sbj}&body=${body}`
    }
    else if(social === 'wp')
    {
      const msg = encodeURIComponent(`Hey, check out this link: [${url}]`);
      link = `https://web.whatsapp.com/send?text=${msg}`;
      
      //const whatsappLink = `https://web.whatsapp.com/send?text=${message}`; //For Whatsapp Application

    }
    else if(social === 'linkdn')
    {
      link = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    else if(social === 'tlg')
    {
      const message = encodeURIComponent(`Hey, check out this link: ${url}`);
      link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${message}`;
    }
    else if(social === 'twt')
    {
      const message = encodeURIComponent(`Hey, check out this link: ${url}`);
      link = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${message}`;
 
    }
    else if(social === 'fb')
    {
      link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; 
    }
    else if(social === 'outlook')
    {
      const sbj = encodeURIComponent("About: ReviewZone.com");
      const body = encodeURIComponent(`Hey, I found this link interesting: [${url}]`);
      link = `mailto:?subject=${sbj}&body=${body}`;
    }
    
    window.open(link, '_blank');
  }

  Liked()
  {
    if(this.userDetails === undefined)
    {
      this.route.navigate(['signIn']);
      return;
    }
    else if(this.userDetails)
    {
      this.pairUserFeed.isLike = !this.pairUserFeed.isLike;
      this.Count.like += this.pairUserFeed.isLike ? 1 : -1; 

      if(this.pairUserFeed.feedId ===''||undefined)
      {
        this.wfeed =
        {
          email:this.userDetails.email,
          entId:this.entDetail.id,
          like:this.pairUserFeed.isLike
        }
        this.postOperation(this.wfeed);
      }
      else if(this.pairUserFeed.feedId !==''||undefined)
      {
        this.wfeed =
        {
          feedId:this.pairUserFeed.feedId,
          like:this.pairUserFeed.isLike
        }
        this.patchOperation(this.wfeed);
      }
    }
  }

  Commented()
  {
    if(this.userDetails === undefined)
    {
      this.route.navigate(['signIn']);
      return;
    }
    else if(this.userDetails)
    {
      if (this.commentInputTxt.newCmt.trim().length > 0)
      {
        this.Count.comment += 1;
        this.pairUserFeed.isComment = true;
        const Cmt = 
        {
          entId:this.entDetail.id, 
          emailId:this.userDetails.email,
          cmtId:this.pairUserFeed.CmtCount, 
          txtComment: this.commentInputTxt.newCmt, 
          dropAt: String(new Date().toISOString()),
        }

        this.cmtList.push(...[Cmt]);
        if(this.pairUserFeed.feedId ===''||undefined)
        {
          this.wfeed =
          {
            email:this.userDetails.email,
            entId:this.entDetail.id,
            cmtId:this.pairUserFeed.CmtCount,
            comment:[{txtCmt:this.commentInputTxt.newCmt, dropAt:String(new Date().toISOString())}]
          }
          this.postOperation(this.wfeed);
        }
        else if(this.pairUserFeed.feedId !==''||undefined)
        {
          this.wfeed =
          {
            feedId:this.pairUserFeed.feedId,
            cmtId:this.pairUserFeed.CmtCount,
            comment:{txtCmt:this.commentInputTxt.newCmt, dropAt:String(new Date().toISOString())}
          }
          this.patchOperation(this.wfeed);
        }

        this.commentInputTxt.newCmt='';
        this.pairUserFeed.CmtCount += 1
      } 
    }
  }

  editComment(index: number)
  {
    this.editingIndex = index;
    if(this.cmtList !== undefined)
    {
      this.commentInputTxt.editCmt = this.cmtList[index].txtComment;
    }
  }

  saveEditedComment(cmtList:commentList, i:number)
  {
    if (this.commentInputTxt.editCmt.trim().length > 0)
    {
      if(this.userDetails)
      {
        const Cmt = 
        {
          entId:this.entDetail.id, 
          emailId:this.userDetails.email,
          cmtId:cmtList.cmtId, 
          txtComment: this.commentInputTxt.editCmt, 
          dropAt: String(new Date().toISOString()),
        }
        this.cmtList[i] = Cmt;

        this.wfeed =
        {
          feedId:this.pairUserFeed.feedId,
          cmtId:cmtList.cmtId,
          comment:{txtCmt: this.commentInputTxt.editCmt, dropAt: new Date().toISOString() }
        }
        this.patchOperation(this.wfeed);
        this.editingIndex = null;
      }
    }
  }

  cancelEdit()
  {
    this.editingIndex = null;
    this.commentInputTxt.editCmt = '';
  }
  deleteComment(cmtList:commentList, i:number)
  {
    if(this.userDetails)
    {
      if(this.pairUserFeed.feedId)
      {
        this.wfeed =
        {
          feedId:this.pairUserFeed.feedId,
          cmtId:cmtList.cmtId
        }
      
        this.feedService.deleteComment(this.wfeed);
        if(i !== -1)
        {
          this.cmtList.splice(i, 1);
        }
      }
    }
  }

  userRate(rating:number)
  {
    if(this.userDetails === undefined)
    {
      this.route.navigate(['signIn']);
      return;
    }
    else if(this.userDetails)
    {
      this.pairUserFeed.rating = rating; 
      if(this.pairUserFeed.feedId ===''||undefined)
      {
        this.wfeed =
        {
          email:this.userDetails.email,
          entId:this.entDetail.id,
          rating:rating
        }
        this.postOperation(this.wfeed);
      }
      else if(this.pairUserFeed.feedId !==''||undefined)
      {
        this.wfeed =
        {
          feedId:this.pairUserFeed.feedId,
          rating:rating
        }
        this.patchOperation(this.wfeed);
      }
    }
  }

  Watched()
  {
    if(this.userDetails === undefined)
    {
      this.route.navigate(['signIn']);
      return;
    }
    else if(this.userDetails)
    {
      if(this.pairUserFeed.isWatch === true)
      {
        alert('EntId already present in WatchList');
      }
      else if(this.pairUserFeed.isWatch === false)
      {
        if(this.userDetails.watchList !== undefined)
        {
          this.pairUserFeed.isWatch = true;
          this.Count.watch +=1;
          if(this.userDetails.userId)
          {
            const fav = {watchId:this.userDetails.watchList.length, entId: this.entDetail.id, entTitle: this.entDetail.title}
            this.userDetails.watchList.push(...[fav]);
            this.userService.userWatchListEdit(this.userDetails.userId, fav).subscribe({
              next: (response) => console.log('WatchList updated:', response),
              error: (err) => console.error('Error updating WatchList', err)});
          }
        }
        else if(this.userDetails.watchList === undefined)
        {
          this.pairUserFeed.isWatch = true;
          if(this.userDetails.userId)
          {
            const fav = {watchId:0, entId: this.entDetail.id, entTitle: this.entDetail.title}
            this.userDetails.watchList = [];
            this.userDetails.watchList.push(...[fav]);
            this.userService.userWatchListEdit(this.userDetails.userId, fav).subscribe({
              next: (response) => console.log('WatchList updated:', response),
              error: (err) => console.error('Error updating WatchList', err)});
          }
        }

        forkJoin
        ([this.userService.userGet(this.userDetails.email),this.userService.usersGet()])
        .subscribe(([resUser, resUsers]) => 
        {
          let watch = false;
          if(resUser.watchList)
          {
            watch = resUser.watchList.some((item:any) => item.entId === this.entDetail.id);
          }

          // Process watchlist
          let Count = 0;
          resUsers.forEach((resUser: any) => 
          {
            const hasEntId = resUser.watchList?.some((item: any) => item.entId === this.entDetail.id);
            if (hasEntId) 
            {
              Count++;
            }
          });

          this.pairUserFeed.isWatch = watch;
          this.Count.watch = Count;
          this.getUsersDetail();
        });
      }
    }
  }

  postOperation(newFeed: wFeedType) 
  {
    this.feedService.postFeedBack(newFeed).subscribe(
    {
      next: (response:any) => {console.log('Feedback added successfully', response)
      this.pairUserFeed.feedId = response.message;
      },
      error: (err) => console.error('Error posting feedback', err)
    });
  }

  patchOperation(updFeed: wFeedType) {
    this.feedService.patchFeedBack(updFeed)
  .subscribe({
    next: (response) => console.log('Feedback updated successfully:', response),
    error: (err) => console.error('Error updating feedback', err)
  });
  }
}