import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  private readonly element: ElementRef = inject(ElementRef);

  // AfterViewInit ensures the component's view and its children are initialized
  ngAfterViewInit(): void {
    // A small delay (setTimeout) can sometimes be necessary to ensure 
    // the element is fully visible/ready, especially after conditional rendering (*ngIf)
    setTimeout(() => {
      this.element.nativeElement.focus();
    }, 150);
  }
}
