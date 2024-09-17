import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/module/material';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    
    MaterialModule
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  constructor(
    private router: Router
  ) {

  }
  onCreateEvent() {
    this.router.navigate(['order-edit']);
  }
}
