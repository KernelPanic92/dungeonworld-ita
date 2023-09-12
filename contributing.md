# Contribuire a dungeonworld-ita
✨ Grazie per il contributo a dungeonworld-ita! ✨

Come contributore, qui trovi tutte le linee guida da seguire:

- [Contribuire a dungeonworld-ita](#contribuire-a-dungeonworld-ita)
  - [Codice di condotta](#codice-di-condotta)
  - [Come posso contribuire?](#come-posso-contribuire)
    - [Migliora la documentazione](#migliora-la-documentazione)
    - [Risolvi gli errori e implementa nuovi materiali](#risolvi-gli-errori-e-implementa-nuovi-materiali)
    - [Segnalazione di errori](#segnalazione-di-errori)
    - [Richiesta di materiali](#richiesta-di-materiali)
  - [Presentazione di una Pull Request](#presentazione-di-una-pull-request)
  - [Regole di codifica](#regole-di-codifica)

## Codice di condotta

Aiutaci a mantenere **dungeonworld-ita** aperto e inclusivo. Ti prego di leggere e seguire il nostro [Codice di condotta](CODE_OF_CONDUCT.md).

## Come posso contribuire?
### Migliora la documentazione

Come utente di **dungeonworld-ita**, sei il candidato ideale per aiutarci a migliorare la nostra documentazione: correzioni di errori di battitura, chiarificazioni, più esempi, nuovi documenti, ecc.

### Risolvi gli errori e implementa nuovi materiali

I problemi confermati e i materiali pronti per essere sviluppati sono marcati con la label [help wanted](https://github.com/KernelPanic92/dungeonworld-ita/labels/help%20wanted).
Posta un commento nella issue per indicare che vuoi lavorarci te o per richiedere aiuto ai maintainers o alla community.

### Segnalazione di errori
Una buona segnalazione di errori non dovrebbe costringere gli altri a cercarti per ottenere ulteriori informazioni. Per favore, cerca di essere il più dettagliato possibile nella tua segnalazione.

### Richiesta di materiali
Le richieste di materiali sono benvenute, ma prenditi un momento per capire se la tua idea si adatta allo scopo e agli obiettivi del progetto. Sta a te presentare un argomento convincente per convincere gli sviluppatori del progetto dei meriti di questa funzionalità. Fornisci il maggior numero possibile di dettagli e contesto.

## Presentazione di una Pull Request

Le buone pull request, che siano correzioni, miglioramenti o nuovi materiali, sono un aiuto fantastico. Dovrebbero rimanere focalizzate nell'ambito e evitare commit non correlati.

**Per favore, chiedi prima** di intraprendere qualsiasi pull request significativa (ad esempio, la riformattazione del layout di tutti i libretti), altrimenti rischi di passare molto tempo a lavorare su qualcosa che i manutentori del progetto potrebbero non voler unire al progetto.

Se non hai mai creato una pull request prima, benvenuto 🎉 😄. [Ecco un ottimo tutorial](https://opensource.guide/how-to-contribute/#opening-a-pull-request) su come inviarne una :)

Ecco un riassunto dei passaggi da seguire:

1. Configura l'ambiente di lavoro con gli strumenti necessari per editare i files
2. Se hai clonato il repository tempo fa, ottieni le ultime modifiche dall'origine e aggiorna le dipendenze:

```bash
$ git checkout master
$ git pull upstream master
```

3. Crea un nuovo ramo tematico (dalla branch di sviluppo principale del progetto) per contenere la tua funzionalità, modifica o correzione:

```bash
$ git checkout -b <nome-branch-tematico>
```

4. Apporta le modifiche al materiale, seguendo le [Regole di codifica](#coding-rules).
5. Fai il push del tuo ramo tematico nel tuo fork:

```bash
$ git push origin <nome-branch-tematico>
```

6. [Apri una pull request](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request) con un titolo e una descrizione chiari.

**Suggerimenti**:

- Per lavori ambiziosi, apri una pull request il prima possibile con il prefisso `[WIP]` nel titolo, al fine di ottenere feedback e assistenza dalla comunità.
- [Consenti ai manutentori di dungeonworld-ita di apportare modifiche al tuo ramo](https://help.github.com/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork).
  In questo modo, possiamo apportare alcune modifiche minori se necessario.
  Tutte le modifiche che apportiamo verranno effettuate in nuovi commit e chiederemo la tua approvazione prima di unirli.

## Regole di codifica

- Evita di formattare a mano e usa gli stili carattere e gli stili paragrafo presenti nei files
- **Modificatori di Caratteristica (FOR, DES, INT, SAG, CAR):** Scrivere i nomi dei **Modificatori di Caratteristica** in MAIUSCOLO. Saranno formattati automaticamente con lo stile carattere `stat` quando utilizzati nei paragrafi.
- **GM:** Scrivere GM in MAIUSCOLO. Sarà formattato automaticamente con lo stile carattere `strong` quando utilizzato nei paragrafi.
- **PF:** Scrivere PF in MAIUSCOLO. Sarà formattato automaticamente con lo stile carattere `strong` quando utilizzato nei paragrafi.
- **Esito dei dadi:** Quando stiamo descrivendo cosa succede in base all'esito del tiro dei dadi, cercare di seguire questa struttura `✴Con un [range valori], [cosa succede].`. I prefissi (es. `✴Con un 10+`) Saranno formattati automaticamente con lo stile carattere `strong` quando utilizzati nei paragrafi.
- Non inventare esiti diversi da quelli standard: [✴Con un 10+, ✴Con un 7-9, ✴Con un 6-, ✴Con un 12+, ✴Con un 7+]
- **Condizione di innesco:** Quando stiamo descrivendo la condizione di innesco di una mossa, il testo successivo al termine `Quando` dovrà essere formattato con lo stile carattere `strong`. Es. "Quando **ti metti in mostra con una prova di forza**, nomina uno dei presenti che
hai impressionato e prendi *+1 al prossimo tiro* di parlamentare con lui".
- **Nomi delle mosse:** Formattare i nomi delle mosse con lo stile carattere `em` (a esclusione di titoli e intestazioni). Questa regola prevale sulla precedente "Condizione di innesco".  Es. "Quando _tagli e spacchi_, con un 12+ infliggi i tuoi danni e scegli qualcosa di fisico che il tuo nemico ha (un'arma, la sua posizione, un'arto): lo perde.". 
- **Nomi delle etichette:** Formattare i nomi delle etichette con lo stile carattere `strong` (a esclusione di titoli e intestazioni).
