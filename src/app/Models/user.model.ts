export interface UserRecord
{
    userId:string|undefined;
    userName:string|undefined;
    mNo:string|undefined;
    email:string;
    password:string|undefined;
    watchList:{watchId:number, entId:string, entTitle:string}[]|undefined
    created:string|undefined;
}

export interface UserUpdate
{
    userId:string|undefined;
    userName:string|undefined;
    mNo:string|undefined;
    email:string;
    watchList:{watchId:number, entId:string, entTitle:string}[]|undefined
    created:string|undefined;
}

export interface LoginRequest
{
    emailOrMobile:string,
    password:string
}