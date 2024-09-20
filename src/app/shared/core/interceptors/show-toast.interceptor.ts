import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ShowToastInterceptor implements HttpInterceptor {

  constructor(
    private toastrService: ToastrService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        // Operation failed; error is an HttpErrorResponse
        error: (error: HttpErrorResponse) => {
          this.toastrService.error(error.error.message, error.error.error);
        }
      })
    );
  }
}
