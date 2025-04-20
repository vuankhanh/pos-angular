import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ICoordinate } from '../../interface/coordinate.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../module/material';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coordinate-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MaterialModule
  ],
  templateUrl: './coordinate-selector.component.html',
  styleUrl: './coordinate-selector.component.scss'
})
export class CoordinateSelectorComponent implements OnInit, OnDestroy {
  @Input() coordinate!: ICoordinate;
  @Output() coordinateChange: EventEmitter<ICoordinate> = new EventEmitter<ICoordinate>();
  private readonly fb = inject(FormBuilder);
  coordinateForm!: FormGroup;

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.coordinateForm = this.fb.group({
      lat: [this.coordinate?.lat || '0', Validators.required],
      lng: [this.coordinate?.lng || '0', Validators.required],
    });

    this.subscription.add(
      this.coordinateForm.valueChanges.subscribe(value => {
        this.coordinateChange.emit(value);
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
