import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, concat, filter, map, Observable, } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterEventService {
  private titleSubject = new BehaviorSubject<string>('');
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  getRouteTitle$(): Observable<string> {
    const title = this.getChildRoute(this.activatedRoute).routeConfig?.title as string;
    this.titleSubject.next(title);

    return concat(
      this.titleSubject.asObservable(),
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getChildRoute(this.activatedRoute)),
        map(route => {
          const newTitle = route.routeConfig?.title as string;
          this.titleSubject.next(newTitle);
          return newTitle;
        })
      )
    );
  }

  updateRouteTitle(newTitle: string): void {
    const route = this.getChildRoute(this.activatedRoute);
    if (route.routeConfig) {
      route.routeConfig.title = newTitle;
      this.titleSubject.next(newTitle);
    }
  }

  private getChildRoute(activatedRoute: ActivatedRoute): ActivatedRoute {
    while (activatedRoute.firstChild) {
      activatedRoute = activatedRoute.firstChild;
    }
    return activatedRoute;
  }
}
