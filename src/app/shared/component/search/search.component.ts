import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../module/material';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MaterialModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Tìm tên';
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  name: FormControl = new FormControl('');

  subscription: Subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.name.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(value => {
        this.search.emit(value);
      })
    )
  }

  clearInput() {
    this.name.setValue('');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
