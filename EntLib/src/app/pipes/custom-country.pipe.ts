import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'key'
})
export class CustomCountryPipe implements PipeTransform {

  transform(value: any): any
  {
    let values:string
    for(var i=0; i<=Object.keys.length; i++)
    {
      values= Object.keys(value)[i]
    }
  }
}
