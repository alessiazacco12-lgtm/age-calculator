// FASE 1 - IMPORT -- Importo gli strumenti Angular necessari: Component crea il componente, signal gestisce i valori che possono cambiare, computed calcola valori derivati da altri signal ed AfterViewInit esegue del codice dopo la creazione degli elementi HTML.
import { AfterViewInit, Component, computed, signal } from '@angular/core';

// Importo il datepicker e il tipo DatepickerInstance.Questo tipo permette di dichiarare correttamente l'istanza del calendario senza usare "any".
import datepicker, { DatepickerInstance } from 'js-datepicker';

// Importo DateTime dalla libreria Luxon. Luxon viene utilizzato per lavorare con le date, ottenere la data di oggi e calcolare anni, mesi e giorni di età.
import { DateTime } from 'luxon';

// FASE 2 - CONFIGURAZIONE DEL COMPONENTE
@Component({
  // Nome utilizzato per richiamare questo componente nell'HTML.
  selector: 'app-age-calculator',

  // Questo componente non importa altri componenti Angular.
  imports: [],

  // File HTML collegato al componente.
  templateUrl: './age-calculator.html',

  // File CSS collegato al componente.
  styleUrl: './age-calculator.css',
})
export class AgeCalculator implements AfterViewInit {
  // FASE 3 - DATI E STATO DEL COMPONENTE --Salvo l'istanza del datepicker usando il tipo corretto. All'inizio può essere undefined perché viene creata in ngAfterViewInit().
  picker: DatepickerInstance | undefined;

  // Questo signal contiene la data di nascita selezionata dall'utente. All'inizio vale null perché non è stata ancora scelta nessuna data.
  birthDate = signal<Date | null>(null);

  // Questo signal indica se l'utente ha premuto Calculate. Serve per mostrare il risultato solo dopo l'invio del form.
  showResult = signal(false);

  // Questo signal contiene un eventuale messaggio di errore.
  errorMessage = signal('');

  // FASE 4 - CALCOLO DEL RISULTATO -- result è un computed perché il risultato dipende dalla data di nascita che vado a selezionare. Angular lo ricalcolerà automaticamente quando cambiano i signal utilizzati al suo interno.
  result = computed(() => {
    // Se Calculate non è ancora stato premuto non mostro nessun risultato.
    if (!this.showResult()) {
      return '';
    }

    // Leggo la data selezionata dal signal birthDate.
    const selectedDate = this.birthDate();

    // Se non è presente una data allora non restituisco alcun risultato.
    if (!selectedDate) {
      return '';
    }

    // Converto la normale Date JavaScript in un oggetto DateTime di Luxon.
    const birthDate = DateTime.fromJSDate(selectedDate).startOf('day');

    // Recupero la data corrente con Luxon.
    const today = DateTime.now().startOf('day');

    // Se la data fosse futura non mostro il risultato.
    if (birthDate > today) {
      return '';
    }

    // Calcolo la differenza tra oggi e la data di nascita espressa in AA/MM/GG.
    const age = today.diff(birthDate, ['years', 'months', 'days']).toObject();

    // Restituisco la frase finale che verrà mostrata nell'HTML.
    return (
      `You are ${Math.floor(age.years ?? 0)} years ` +
      `${Math.floor(age.months ?? 0)} months ` +
      `${Math.floor(age.days ?? 0)} days old`
    );
  });

  // FASE 5 - CREAZIONE DEL DATEPICKER -- ngAfterViewInit() viene eseguito quando Angular ha già creato gli elementi HTML del componente. Lo utilizzo perché il datepicker deve essere collegato all'input con id="birthDate".
  ngAfterViewInit() {
    // Creo il datepicker e lo collego al campo birthDate.
    this.picker = datepicker('#birthDate', {
      // Impedisco di scegliere una data successiva a oggi perché una data di nascita futura non può essere valida.
      maxDate: new Date(),

      // Mantengo attiva la selezione rapida del mese e dell'anno.
      disableYearOverlay: false,

      // formatter stabilisce come viene visualizzata la data scelta dentro l'input. Il formato utilizzato è GG/MM/AAAA.
      formatter: (input, date) => {
        input.value = DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');
      },

      // onSelect viene eseguito quando l'utente seleziona una data dal calendario.
      onSelect: (_instance, date) => {
        // Controllo che la data esista prima di utilizzarla.
        if (date) {
          // Salvo la data selezionata nel signal birthDate.
          this.birthDate.set(date);

          // Se viene scelta una nuova data nascondo il vecchio risultato finché non viene premuto nuovamente "Calculate".
          this.showResult.set(false);

          // Elimino eventuali errori precedenti.
          this.errorMessage.set('');
        }
      },
    });
  }

  // FASE 6 - APERTURA E CHIUSURA DEL CALENDARIO -- Questo metodo viene eseguito quando l'utente clicca sull'icona del calendario.
  toggleCalendar(event: MouseEvent) {
    // Impedisco al click di propagarsi nella pagina.
    event.stopPropagation();

    // Controllo che il datepicker sia stato inizializzato prima di utilizzare i suoi metodi.
    if (!this.picker) {
      return;
    }

    // Controllo se il calendario è nascosto.
    const isHidden = this.picker.calendarContainer.classList.contains('qs-hidden');

    // Se è nascosto lo apro, caso contrario lo chiudo.
    if (isHidden) {
      this.picker.show();
    } else {
      this.picker.hide();
    }
  }

  // FASE 7 - INVIO DEL FORM E VALIDAZIONE -- Questo metodo viene eseguito quando l'utente preme Calculate.
  calculateAge(event: Event) {
    // Impedisco al form di ricaricare la pagina.
    event.preventDefault();

    // Elimino eventuali messaggi di errore precedenti.
    this.errorMessage.set('');

    // Leggo la data selezionata.
    const selectedDate = this.birthDate();

    // Se non è stata selezionata una data, mostro un messaggio di errore.
    if (!selectedDate) {
      this.showResult.set(false);
      this.errorMessage.set('Please select a valid birth date.');
      return;
    }

    // Se la data esiste, permetto al computed result di mostrare il risultato.
    this.showResult.set(true);
  }
}
