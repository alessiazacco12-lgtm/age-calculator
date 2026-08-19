// Importa Component, necessario per creare un componente Angular.
import { Component } from '@angular/core';

// Importa il componente AgeCalculator.
import { AgeCalculator } from './components/age-calculator/age-calculator';

@Component({
  // Nome del componente principale usato nell'HTML.
  selector: 'app-root',

  // Rende disponibile AgeCalculator dentro questo componente.
  imports: [AgeCalculator],
  
  // Collega il file HTML del componente.
  templateUrl: './app.html',

  // Collega il file CSS del componente.
  styleUrl: './app.css'
})
export class App {}
