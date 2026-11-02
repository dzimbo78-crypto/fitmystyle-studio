# FitMyStyle Catalog Radar 5.0 — dostęp do katalogów i zasady współpracy

## Co działa

**W przeglądarce**: podanie URL sprzedawcy, podpowiedź WooCommerce Store API, publicznego eksportu Shopify (jeśli sklep pozwala), danych Product JSON-LD z publicznej strony i feedu od partnera. Wybór źródła ustawia istniejący importer; import w przeglądarce działa tylko gdy sklep pozwala na CORS, użytkownik ma uprawnienie do używania danych i produkt zawiera wystarczające warianty. Import lokalnego HTML działa, jeżeli dokument zawiera Product JSON-LD. Można pobrać wiadomość do sprzedawcy i manifest zatwierdzonego feedu. System pokazuje podstawowe wskaźniki jakości produktów (brak rozmiaru, SKU, zdjęcia, statusu).

**W Node.js (odizolowany folder)**: `scripts/catalog-radar.mjs` proponuje możliwe endpointy i potrafi sprawdzić maksymalnie trzy dozwolone publiczne odpowiedzi po podaniu referencji zgody. `scripts/sync-licensed-feeds.mjs` pobiera zatwierdzone feedy, przetwarza maksymalnie 10 stron Woo/Shopify na źródło, respektuje robots.txt i błędy ograniczeń, normalizuje produkty, aktualizuje wspólny katalog JSON oraz audyt (tylko jeśli wszystkie źródła się powiodą). Dostępne także opcjonalne pobieranie publicznych wariantów WooCommerce z mapowaniem do produktu rodzica.

## Rozwiązania bez płatnych API

1. **WooCommerce Store API**: `https://merchant.example/wp-json/wc/store/v1/products?per_page=50&page=1` — publiczne dla sklepów, które go udostępniają. Nadal sprawdź warunki wykorzystania katalogu i zdjęć. Dla produktów typu variable może być konieczne pobranie `?type=variation`, a nawet wtedy nie każda witryna oddaje pełne warianty.
2. **Shopify products.json**: tylko tam, gdzie sprzedawca rzeczywiście udostępnia taką metodę i pozwala na jej używanie. Nie obchodzić Web Bot Auth ani limitów. Alternatywa: feed partnerski lub autoryzowany eksport.
3. **Google Merchant XML / RSS / CSV**: eksport od właściciela sklepu, często generowany przez jego platformę handlową.
4. **Schema.org Product JSON-LD**: zapis strony produktu jako HTML i import lokalny lub autoryzowany odczyt publicznej strony po robots.txt. Nie jest to zawsze lista rozmiarów.
5. **Afiliacja**: feed Awin/CJ/TradeDoubler po zatwierdzeniu konta wydawcy i programu sklepu — zależy od dostępności w konkretnym programie.
6. **Dropshipping / print-on-demand**: Printify, Gelato, Printful, Syncee i hurtownie na umowie; wymagają konta/klucza i zatwierdzenia integracji. Nigdy nie wpisywać kluczy w JS strony statycznej.
7. **Własny feed dostawcy**: najlepsze dla małej odzieżowej marki PL/DK — raz uzyskane pliki mogą być synchronizowane bez opłat dostawcy za API, o ile zezwala na to umowa.

## CLI — bez ryzyka dla istniejących projektów

```bash
# Lokalna lista możliwych źródeł (NIE pobiera danych)
node scripts/catalog-radar.mjs --site https://twoj-partner.example

# Diagnostyka max 3 publicznych odpowiedzi; tylko gdy masz zgodę
node scripts/catalog-radar.mjs --site https://twoj-partner.example --license-reference ZGODA-123 --check --output raport.json

# Przygotuj data/licensed-feeds.json przez panel FitMyStyle, po udokumentowanej zgodzie
node scripts/sync-licensed-feeds.mjs
node --test tests/*.test.mjs
node scripts/build.mjs
```

`data/licensed-feeds.json` nie jest tworzone domyślnie. Brak zatwierdzonych feedów oznacza zero produktów partnerów (nie fikcyjne rekordy). Zgoda i prawa do zdjęć muszą być rzeczywiste; pole `licenseReference` jest wyłącznie deklaracją konfiguracji, nie automatyczną weryfikacją umowy.

## Bezpieczeństwo

- Wyłącznie HTTPS z publiczną domeną i portem 443; przed połączeniem sprawdzane są publiczne rekordy DNS. Nie jest to publiczny proxy ani rozwiązanie odporne na wszystkie formy DNS rebinding — nigdy nie pozwalaj niezweryfikowanym użytkownikom wywoływać skanera po stronie serwera.
- Brak loginów, cookies, przechwytywania sesji, CAPTCHAs, płatnych API obchodzonych nieautoryzowanym dostępem, automatycznych ponowień po 401/403/429, nadpisywania robots.txt i łańcuchów przekierowań.
- Maksymalnie 16 MB/plik, 20 dostawców, 5000 produktów w wspólnym katalogu, do 10 stron / dostawcę. Aktualizacja nie zastępuje poprzedniego katalogu, gdy którykolwiek dostawca zwróci błąd.
- Nie wolno traktować stanu z feedu jako gwarancji dostępności ani przygotowanej konfiguracji jako aktywnego połączenia.
- W Render Static Site nie ma bezpiecznego serwera checkout — prawdziwy sklep potrzebuje backendu i operatora płatności. Dostawcy mogą mieć bezpłatne integracje, ale produkcja/dostawa i transakcje kosztują.

## Izolacja

Nowe repozytorium i nowa usługa Render są wymagane. Nie wybieraj B-CORE ani żadnych obecnych repozytoriów/usług. W tym pakiecie nie ma rzeczywistych kluczy, kont ani połączeń do projektów użytkownika.