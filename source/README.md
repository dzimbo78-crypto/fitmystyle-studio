# FitMyStyle Studio 8.1 — niezależna aplikacja

**Przeznaczenie:** witryna publiczna i modularne studio do stylizacji, personalizacji nadruków, tworzenia wstępnych wykrojów, analizy feedów sklepowych oraz wizualizacji 3D.

## Dwie wersje

- `FitMyStyle_Studio_8_OFFLINE.html`: samodzielna wersja bez serwera. Wystarczy otworzyć plik w przeglądarce.
- Projekt źródłowy: `index.html`, `src/`, `media/`, `data/`, `scripts/`, `tests/`, `supabase/`. Publikowanie przez `node scripts/build.mjs`, katalog `dist`.

W trybie gościa dane są przechowywane w **sessionStorage** bieżącej karty i zwykle znikają po jej zamknięciu. Nie obiecuj, że przeglądarka nigdy nie przywróci sesji po awarii. Gdy sessionStorage jest niedostępne, aplikacja używa pamięci RAM i nie zapisuje danych między odświeżeniami.

## Uwierzytelnianie i zapisywanie projektów

Kod obsługuje logowanie / rejestrację, reset hasła oraz synchronizację prywatnych projektów z Supabase REST + Auth. **Konta online są domyślnie wyłączone**, do czasu uruchomienia osobnego projektu Supabase dla FitMyStyle. Nie istnieją fikcyjne konta użytkowników.

Wykonaj SQL z `supabase/schema.sql` w osobnym projekcie Supabase. Ustaw WYŁĄCZNIE publiczny URL i klucz anon/publishable w `site-config.mjs`, nigdy `service_role`. RLS jest obowiązkowy. Zbuduj stronę ponownie. Zewnętrznego dostępu do bazy ani kont innych projektów nie wolno używać.

## Manekin techniczny

Manekin można otworzyć bezpośrednio z wygenerowanego rodzinnego zestawu, co przenosi do podglądu osobę, fason wywnioskowany z nazwy ubrania i kolor. Manekin jest interaktywnym renderowaniem parametrycznego modelu 3D na Canvas: obrót 360°, gesty, zoom, fasony, kolory, szwy, siatka, PNG. Nie jest symulatorem materiału, skanem ciała, zaawansowaną przymierzalnią fotorealistyczną ani certyfikowanym CAD.

## Sklepy i zamówienia

432 warianty demonstracyjne to tylko inspiracje, nie produkty możliwe do kupienia. Publiczny katalog jest początkowo pusty. Nie połączono rzeczywistych dostawców, nie ma płatności ani automatycznych wysyłek. Konta afiliacyjne/dropshippingowe i umowy z dostawcami są niezależnymi wymaganiami.

## Testy

`node --test tests/*.test.mjs` — 116 testów modułowych.
Dodatkowo 40 asercji UI w Chromium na desktopie i telefonie dla 7 ekranów, manekina 3D, braku błędów JS, responsywności i wyłączonego bezpiecznie logowania bez backendu.

## Bezpieczeństwo i izolacja

Projekt jest zupełnie niezależny od wszystkich innych aplikacji. Brak wspólnego API, bazy, plików, repozytoriów i sekretów. Szczegóły: `ISOLATION.md`.


## Repozytorium do docelowego wdrożenia

**Wyłącznie nowe repozytorium:** `dzimbo78-crypto/fitmystyle-studio` (utworzone i podłączone do nowej usługi Render). Właścicielem ma być `dzimbo78-crypto`, nie `pbw78`. Nie używamy żadnych istniejących repozytoriów, usług ani sekretów. Nie inicjuj `git remote` do innego repozytorium.

### Darmowy hosting

Uruchom `node --test tests/*.test.mjs && node scripts/build.mjs`. Na Render stwórz nową usługę **Static Site**, wskaż wyłącznie nowe repozytorium, `Build Command`: `node --test tests/*.test.mjs && node scripts/build.mjs`, `Publish Directory`: `dist`. Darmowy statyczny hosting nie obejmuje prawdziwego backendu kont i płatności.

### Zmiany 8.0

- Warstwowa wizualizacja ubioru manekina (osobno góra/dół, kolory, szwy).
- Eksport specyfikacji 3D do JSON — dokument poglądowy, nie zlecenie produkcyjne.
- Osobna nazwa usługi `fitmystyle-v8-independent` w `render.yaml`.
- Osobny cache PWA `fitmystyle-v8`, bez współdzielenia ze starszymi wersjami.
- Nie ma żadnych danych ani sekretów B-CORE, a katalog rzeczywistych ofert startuje pusty.

### 8.1: eksport, sesje i karta techniczna

- Wersja gościa zawiera eksport kopii danych oraz ręczne czyszczenie danych FitMyStyle w obrębie jednej domeny; inne aplikacje i klucze nie są dotykane.
- Manekin udostępnia kartę techniczną do wydruku z widokiem przód/tył i zestawieniem ustawień. Nie jest to gotowa dokumentacja produkcyjna.
- Publiczna aplikacja na Render jest samodzielnym plikiem HTML, zapewniającym dostęp do modułów bez zapisu serwerowego.
Publikacja: https://fitmystyle-studio-independent.onrender.com
