export interface commentList
{
  entId:string, 
  emailId:string,
  cmtId:number, 
  txtComment: string, 
  dropAt: string 
}

export interface Comment 
{
  Id:string
  TxtCmt: string;  // Match with the C# property name "TextCmt"
  DropAt: Date;  // Match with the C# property name "CreatedAt"
}
  

export interface FeedBack 
{
  feedId?:string
  email?: string;            // Optional, as it can be null in the C# model
  entId: string;
  like: boolean;
  comment?: Comment[];       // Represents a collection of Comment objects
  rating: number;
}

export interface wFeedType
{
  feedId?:string|undefined;
  entId?:string|undefined;
  cmtId?:number|undefined;
  email?:string|undefined;
  like?:boolean|undefined;
  comment?:{txtCmt:string, dropAt:string}|[{txtCmt:string, dropAt:string}]|undefined;
  rating?:number|undefined;
}

