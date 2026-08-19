// FASE 1 - IMPORT -- Importo gli strumenti Angular necessari.
// Component:permette di creare il componente.
// signal: permette di memorizzare valori che possono cambiare e di aggiornare automaticamente il template.
// AfterViewInit: permette di eseguire del codice dopo che Angular ha creato gli elementi HTML del componente.
import { AfterViewInit, Component, signal } from '@angular/core';

// Importo il JavaScript Datepicker installato tramite npm. Questo pacchetto viene utilizzato per permettere all'utente di selezionare la propria data di nascita senza utilizzare il datepicker HTML predefinito.
import datepicker from 'js-datepicker';

// Importo DateTime dalla libreria Luxon. Luxon verrà utilizzato per lavorare con le date, ottenere la data di oggi e calcolare AA, MM e GG di età.
import { DateTime } from 'luxon';

// FASE 2 - CONFIGURAZIONE DEL COMPONENTE.
@Component({

  // Nome utilizzato per richiamare questo componente nell'HTML.
  selector: 'app-age-calculator',

  // Questo componente non importa altri componenti Angular.
  imports: [],

  // File HTML collegato al componente.
  templateUrl: './age-calculator.html',

  // File CSS collegato al componente.
  styleUrl: './age-calculator.css'
})

export class AgeCalculator implements AfterViewInit {

  // FASE 3 - DATI E STATO DEL COMPONENTE -- Questa variabile contiene l'istanza del datepicker. La salvo perché successivamente devo poter utilizzare alcuni metodi messi a disposizione dal pacchetto: show() -> apre il calendario e hide() -> chiude il calendario.
  picker: any;

  // Questo signal contiene la data di nascita selezionata dall'utente. All'inizio vale null perché non è stata ancora selezionata nessuna data. Dopo la selezione conterrà un oggetto Date.
  birthDate = signal<Date | null>(null);

  // Questo signal contiene il risultato finale. Per esempio: You are 23 years 11 months 6 days old. All'inizio è una stringa vuota perché il calcolo non è ancora stato effettuato.
  result = signal('');

  // Questo signal contiene un eventuale messaggio di errore. Per esempio viene utilizzato quando non è stata selezionata una data valida.
  errorMessage = signal('');

  // FASE 4 - CREAZIONE DEL DATEPICKER -- ngAfterViewInit() è un lifecycle hook di Angular. Viene eseguito quando Angular ha già creato gli elementi HTML del componente. Lo utilizzo perché il datepicker deve essere collegato all'input con id="birthDate", che a questo punto esiste già nella pagina.
  ngAfterViewInit() {

  // Creo il datepicker e lo collego al campo con id="birthDate". Anche se è collegato all'input, tramite il CSS impediremo il click sulla barra. Il calendario verrà quindi aperto solamente tramite l'icona.
  this.picker = datepicker('#birthDate', {

  // Impedisco di scegliere una data successiv alla data di oggi essendo che una futura risulterebbe non ancora trascorsa dunque non valida.
  maxDate: new Date(),

  // Mantengo attiva la selezione rapida del mese e dell'anno. Quando il calendario è aperto, cliccando sul MM/AA nella parte superiore si può scegliere un mese e inserire un anno. Questo è utile, ad esempio, per raggiungere velocemente l'anno 2002.
  disableYearOverlay: false,

  // formatter stabilisce come deve essere visualizzata la data dentro l'input. Il datepicker fornisce la data come Date JavaScript. La converto con Luxon e utilizzo il formato: GG/MM/AA. Ad esempio: 12/09/2002
  formatter: (input, date) => {
        input.value = DateTime
          .fromJSDate(date)
          .toFormat('dd/MM/yyyy');
      },

   // onSelect viene eseguito automaticamente quando l'utente seleziona un giorno dal calendario. "date" contiene la data scelta.
   onSelect: (instance, date) => {

    // js-datepicker può restituire: Date -> se è stata selezionata una data undefined -> se non abbiamo una dataPer questo controllo prima che date esista.
   if (date) {

    // Salvo la data nel signal birthDate. Questa è la data che utilizzeremo successivamente per effettuare il calcolo dell'età con Luxon.
   this.birthDate.set(date);}}});}

  // FASE 5 - APERTURA E CHIUSURA DEL CALENDARIO -- Questo metodo viene eseguitoquando l'utente clicca sull'icona 📅. Riceve il MouseEvent attraverso $event passato dal template HTML.
  toggleCalendar(event: MouseEvent) {
  // Impedisco al click di propagarsi nella pagina. Questo passaggio è importante perché js-datepicker utilizza i click esterni anche per decidere quando chiudere il calendario.
  event.stopPropagation();
  // Controllo direttamente se il calendario contiene la classe "qs-hidden". qs-hidden significa che il calendario in questo momento è nascosto.
  const isHidden = this.picker.calendarContainer.classList.contains('qs-hidden');
  // Se è nascosto -> lo apro con show(). Se è già visibile -> lo chiudo con hide(). In questo modo la stessa icona funziona sia per aprire sia per chiudere il calendario.
    if (isHidden) {
      this.picker.show();
    } else {
      this.picker.hide();
    }
  }

  // FASE 6 - INVIO DEL FORM -- Questo metodo viene eseguito quando l'utente preme Calculate.
  calculateAge(event: Event) {

  // Normalmente l'invio di un form HTML provoca il ricaricamento della pagina. preventDefault() impedisce questo comportamento perché vogliamo visualizzare il risultato direttamente nella stessa pagina.
  event.preventDefault();
  // Prima di effettuare un nuovo calcolo elimino eventuali risultati o errori precedenti.
    this.result.set('');
    this.errorMessage.set('');
  // Leggo il valore attuale del signal birthDate. Con i signal: this.birthDate.set(...) -> modifica il valore this.birthDate() -> legge il valore
  const selectedDate = this.birthDate();

  // FASE 7 - VALIDAZIONE -- Controllo che l'utente abbia effettivamente selezionato una data. Se il signal contiene null, mostro un messaggio di errore e interrompo il metodo con return.
  if (!selectedDate) {
      this.errorMessage.set(
        'Please select a valid birth date.'
      );
      return;
    }


   //Il datepicker restituisce una normale Date JavaScript. DateTime.fromJSDate() la trasforma in un oggetto DateTime di Luxon.  startOf('day') elimina ore, minuti e secondi perché per il calcolo dell'età ci interessa solamente il giorno.
    const birthDate = DateTime.fromJSDate(selectedDate).startOf('day');
   // Recupero la data corrente attraverso Luxon.  Anche qui considero solamente il giorno.
    const today = DateTime.now().startOf('day');

  // Faccio comunque un ulteriore controllo per assicurarci che la data di nascit non sia successiva alla data di oggi.
    if (birthDate > today) {
      this.errorMessage.set(
        'Birth date cannot be in the future.'
      );
      return;
    }

    // FASE 8 - CALCOLO DELL'ETÀ CON LUXON -- diff() calcola la differenzatra due date. In questo caso: data di oggi - data di nascita. Indico a Luxon che voglio il risultato espresso in: - YY/MM/DD. toObject() trasforma il risultato  in un normale oggetto JavaScript.
    const age = today
      .diff(birthDate,['years', 'months', 'days']).toObject();

    // FASE 9 - CREAZIONE DEL RISULTATO --  Creo la frase finale da mostrare nella pagina. Math.floor() assicura che i valori siano interi. ?? 0 significa: se un valore non fosse disponibile, utilizzo 0 come valore di sicurezza.
    this.result.set(
      `You are ${Math.floor(age.years ?? 0)} years ` +
      `${Math.floor(age.months ?? 0)} months ` +
      `${Math.floor(age.days ?? 0)} days old`
    );
  }
}