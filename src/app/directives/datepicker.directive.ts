// Il file "datepicker.directive.ts" mi permette di gestire bene il calendario.

// FASE 1 - IMPORT -- Directive permette di creare una direttiva Angular. ElementRef permette di accedere all'elemento HTML su cui viene applicata la direttiva. OnInit permette di eseguire il codice quando la direttiva viene inizializzata. output permette di inviare dati dalla direttiva al componente.
import { Directive, ElementRef, OnInit, output } from '@angular/core';

// Importo il datepicker e il tipo corretto della sua istanza.
import datepicker, { DatepickerInstance } from 'js-datepicker';

// Importo Luxon per formattare la data selezionata.
import { DateTime } from 'luxon';

// FASE 2 - CONFIGURAZIONE DELLA DIRETTIVA
@Directive({
  // La direttiva viene utilizzata nell'HTML con appDatepicker.
  selector: '[appDatepicker]',
  exportAs: 'appDatepicker',
})
export class DatepickerDirective implements OnInit {
  // Salvo l'istanza del datepicker con il suo tipo corretto.
  picker: DatepickerInstance | undefined;

  // Questo output invia al componente la data scelta dall'utente. Ovvero, quando l'utente sceglie una data, la direttiva può inviarla all'esterno.
  dateSelected = output<Date>();

  // ElementRef permette di recuperare direttamente l'input su cui viene applicata la direttiva.
  constructor(private element: ElementRef<HTMLInputElement>) {}

  // FASE 3 - CREAZIONE DEL DATEPICKER
  ngOnInit() {
    // Creo il datepicker direttamente sull'input che utilizza la direttiva. Non uso più #birthDate ma la direttiva usa direttamente l'el. HTML su cui è stata applicata.
    this.picker = datepicker(this.element.nativeElement, {
      // Impedisco di scegliere una data futura.
      maxDate: new Date(),

      // Mantengo attiva la selezione rapida del mese e dell'anno.
      disableYearOverlay: false,

      // Imposto il formato della data mostrata nell'input.
      formatter: (input, date) => {
        input.value = DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');
      },

      // Quando viene selezionata una data, la invio al componente.
      onSelect: (_instance, date) => {
        if (date) {
          this.dateSelected.emit(date);
        }
      },
    });
  }

  // FASE 4 - APERTURA E CHIUSURA DEL CALENDARIO -- Questo metodo apre/chiude il calendario.
  toggleCalendar(event: MouseEvent) {
    event.stopPropagation();

    // Controllo che il datepicker sia stato inizializzato.
    if (!this.picker) {
      return;
    }

    // Controllo se il calendario è nascosto. Se è nascosto lo apro sennò lo chiudo.
    const isHidden = this.picker.calendarContainer.classList.contains('qs-hidden');

    if (isHidden) {
      this.picker.show();
    } else {
      this.picker.hide();
    }
  }
}
