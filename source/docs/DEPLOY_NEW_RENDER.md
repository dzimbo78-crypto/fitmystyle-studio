# FitMyStyle 8.0 — nowe konto repozytorium i nowy Render

## Wymóg właściciela

Właściciel: `dzimbo78-crypto` (aktualnie autoryzowane konto GitHub). Repozytorium: **nowe** `fitmystyle-studio`, nigdy B-CORE ani inna istniejąca aplikacja.

Konektor GitHub w tej sesji nie udostępnia operacji „create repository”. Nie możemy tworzyć repozytorium przez omijanie API ani przez komitowanie do innego projektu. Po utworzeniu pustego repozytorium z README na koncie `dzimbo78-crypto` konektor ma zapewnić zapis; wtedy możliwe jest automatyczne przesłanie przygotowanych plików.

Bezpośredni link: https://github.com/new?name=fitmystyle-studio&owner=dzimbo78-crypto

## Publikowanie strony na Render — osobna usługa

1. W repozytorium `dzimbo78-crypto/fitmystyle-studio` powinny znajdować się pliki źródłowe z paczki, a na gałęzi `main` przynajmniej jeden commit.
2. Utwórz **nową usługę Static Site** w Render, nigdy nie aktualizuj istniejącej.
3. Nazwa: `fitmystyle-v8-independent`; repo: `https://github.com/dzimbo78-crypto/fitmystyle-studio.git`; gałąź `main`.
4. Build: `node --test tests/*.test.mjs && node scripts/build.mjs`; publish path: `dist`.
5. NIE kopiuj żadnych zmiennych środowiskowych, sekretów, baz ani plików z innych projektów.
6. Gdy wgrany jest tylko pojedynczy `index.html` (szybki start), wybierz build `echo ready` oraz publish path `.`; to wersja tylko do demonstracji, bez niezależnych plików źródłowych.

## Produkcja i konta

Nowa baza / uwierzytelnianie musi stanowić osobny projekt FitMyStyle. Wstrzymaj funkcje logowania do czasu ustawienia publicznego endpointu Supabase i RLS. Żadne dane z B-CORE ani pozostałych projektów nie są wykorzystywane. Nie włączaj płatności bez operatora i umowy z dostawcą.