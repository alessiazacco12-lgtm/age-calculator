// Questo file "age-calculator.ts" mi permette di gestire bene il calcolo dell'età.

// FASE 1 - IMPORT -- Importo gli strumenti Angular necessari: component crea il componente, signal gestisce i valori che possono cambiare, computed calcola valori derivati da altri signal.
import { Component, computed, signal } from '@angular/core';

// Importo DateTime dalla libreria Luxon. Luxon viene utilizzato per lavorare con le date e calcolare AA/MM/GG di età.
import { DateTime } from 'luxon';

// Importo la direttiva che si occupa della gestione del datepicker.
import { DatepickerDirective } from '../../directives/datepicker.directive';

// FASE 2 - CONFIGURAZIONE DEL COMPONENTE
@Component({
  // Nome utilizzato per richiamare questo componente nell'HTML.
  selector: 'app-age-calculator',

  // Rendo disponibile la direttiva DatepickerDirective all'interno del template di questo componente.
  imports: [DatepickerDirective],

  // File HTML collegato al componente.
  templateUrl: './age-calculator.html',

  // File CSS collegato al componente.
  styleUrl: './age-calculator.css',
})
export class AgeCalculator {
  // FASE 3 - DATI E STATO DEL COMPONENTE -- Questo signal contiene la data di nascita selezionata dall'utente. All'inizio vale "null" perché non è ancora stata scelta nessuna data.
  birthDate = signal<Date | null>(null);

  // Questo signal indica se l'utente ha premuto "Calculate". Serve per mostrare il risultato solo dopo l'invio del form.
  showResult = signal(false);

  // Questo signal contiene un eventuale messaggio di errore.
  errorMessage = signal('');

  // FASE 4 - CALCOLO DEL RISULTATO -- "result" è un computed perché il risultato dipende dalla data di nascita selezionata. Angular lo ricalcola automaticamente quando cambiano i signal utilizzati al suo interno.
  result = computed(() => {
    // Se "Calculate" non è ancora stato premuto non mostro nessun risultato.
    if (!this.showResult()) {
      return '';
    }

    // Leggo la data selezionata dal signal birthDate.
    const selectedDate = this.birthDate();

    // Se non è presente una data non restituisco alcun risultato.
    if (!selectedDate) {
      return '';
    }

    // Converto la "Date JavaScript" in un oggetto DateTime di Luxon.
    const birthDate = DateTime.fromJSDate(selectedDate).startOf('day');

    // Recupero "la data corrente" con Luxon. Poi, se la data fosse una futura non mostro il risultato.
    const today = DateTime.now().startOf('day');

    if (birthDate > today) {
      return '';
    }

    // Calcolo la differenza tra oggi e la data di nascita espressa in AA/MM/GG.
    const age = today.diff(birthDate, ['years', 'months', 'days']).toObject();

    // Restituisco la frase finale da mostrare nell'HTML.
    return (
      `You are ${Math.floor(age.years ?? 0)} years ` +
      `${Math.floor(age.months ?? 0)} months ` +
      `${Math.floor(age.days ?? 0)} days old`
    );
  });

  // FASE 5 - DATA RICEVUTA DAL DATEPICKER -- Questo metodo riceve dalla direttiva la data scelta dall'utente nel calendario.
  selectBirthDate(date: Date) {
    // Salvo la data ricevuta nel signal birthDate.
    this.birthDate.set(date);

    // Se viene scelta una nuova data allora nascondo il risultato precedente finché non viene premuto nuovamente "Calculate".
    this.showResult.set(false);

    // Elimino eventuali messaggi di errore precedenti.
    this.errorMessage.set('');
  }

  // FASE 6 - INVIO DEL FORM E VALIDAZIONE -- Questo metodo viene eseguito quando l'utente preme il pulsante "Calculate".
  calculateAge(event: Event) {
    // Impedisco al form di ricaricare la pagina.
    event.preventDefault();

    // Elimino eventuali messaggi di errore precedenti.
    this.errorMessage.set('');

    // Leggo la data selezionata.
    const selectedDate = this.birthDate();

    // Se non è stata selezionata una data allora mostro un messaggio di errore.
    if (!selectedDate) {
      this.showResult.set(false);
      this.errorMessage.set('Please select a valid birth date.');
      return;
    }

    // Se la data esiste allora consento al computed result di mostrare il risultato.
    this.showResult.set(true);
  }
}
