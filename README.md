# Ukelonn-app

En enkel app for barn og foresatte der man registrerer oppgaver hjemme og beregner ukelonn (eller manedslonn) basert pa:

- obligatoriske oppgaver som ma fullfores for a fa grunnbelop
- ekstraoppgaver som gir poeng
- nivaaer som gir ekstra utbetaling ved nok poeng
- overforing av ubrukt poeng til neste periode

All data lagres lokalt i nettleseren (localStorage).

## Funksjoner

- To tilganger:
	- Barnetilgang: kan registrere utforte oppgaver.
	- Foreldretilgang: PIN-beskyttet admin for regler, nivaaer, avslutning av periode og vedlikehold.
- Stotte for flere barn i samme app med egen profil per barn.
- Velg periode: uke eller maned.
- Sett grunnbelop for ukelonn.
- Definer obligatoriske oppgaver med antall ganger de ma gjores.
- Definer ekstraoppgaver med poengverdi.
- Definer flere nivaaer for ekstra utbetaling (min poeng -> ekstra kr).
- Registrer utforte oppgaver med dato/tid.
- Avslutt perioden for a beregne utbetaling og flytte resterende poeng videre.
- Se historikk over tidligere perioder.

## Kom i gang

Kjor i prosjektmappen:

```bash
npm install
npm run dev
```

Bygg for produksjon:

```bash
npm run build
```

Kjor lint:

```bash
npm run lint
```

## Foreldretilgang

- Standard foreldre-PIN: `1234`
- Bytt PIN i foreldrevisningen etter innlogging.

## Neste steg: backend

For neste fase kan vi sette opp backend med:

- autentisering med foreldrerolle og barnerolle
- sentral lagring i database (i stedet for kun localStorage)
- oversiktspanel for forelder pa tvers av barn og perioder
- API for oppgaver, registreringer, poengberegning og utbetaling

Hvis du vil, kan jeg bygge backend i neste steg med Node.js + Express + PostgreSQL og koble den til denne frontend-en.
