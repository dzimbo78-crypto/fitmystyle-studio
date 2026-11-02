# FitMyStyle 5.1 — realne źródła produktów, bez obchodzenia zabezpieczeń

## 1. WooCommerce Store API (bez klucza do publicznych produktów)

Endpoint: `https://SKLEP.example/wp-json/wc/store/v1/products?per_page=100&page=1`. Oficjalna dokumentacja: https://developer.woocommerce.com/docs/apis/store-api/ . Aplikacja może zapytać 1, 3 lub 5 stron. Sklep musi zezwalać przeglądarce na CORS. Publiczna dostępność API nie zastępuje pozwolenia na dalsze wykorzystanie danych, zdjęć i linków. Produktów wariantowych bez poprawnego mapowania rozmiarów nie traktujemy jako pewnej dostępności.

## 2. Shopify public JSON (tylko po upoważnieniu)

U niektórych sprzedawców dostępne jest `/products.json?limit=100`, ale sklep może ograniczyć dostęp, a samo istnienie endpointu nie oznacza zgody na zbieranie katalogu lub komercyjne ponowne wykorzystanie. Aplikacja nie omija ograniczeń i nie stosuje ukrytych proxy. Zalecana współpraca ze sklepem w formie zatwierdzonego eksportu/feedu.

## 3. Programy afiliacyjne

Awin oficjalnie opisuje feedy produktowe dla zaakceptowanych wydawców: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro . Eksport CSV/Google Merchant może zawierać identyfikatory, ceny, obrazki, rozmiary i linki do ofert. API/download może wymagać specjalnego klucza i prawa uczestnictwa; importer obsługuje plik po pobraniu przez użytkownika, ale nie omija autoryzacji. Linki afiliacyjne mogą podlegać dodatkowym ograniczeniom.

## 4. Własna produkcja na zamówienie

Printify, Gelato i Printful to kandydaci do przyszłego fulfillmentu. Żadna integracja nie jest aktywna w wersji 4.0. Producent musi zatwierdzić nadruki i SKU. Produkcja i wysyłka są płatne za konkretne zamówienie.

## 5. Synchronizacja publicznej biblioteki bez CORS

W pełni publiczna, licencjonowana lista może zostać pobrana do statycznego katalogu `data/catalog-public.json` przez uruchomienie `node scripts/sync-licensed-feeds.mjs` na komputerze lub w GitHub Actions. Nie działa jak publiczny otwarty proxy; lista jest jawna, nie dopuszcza tokenów w URL i nie pobiera stron wymagających logowania. Wymaga skonfigurowania `data/licensed-feeds.json` z udokumentowaną zgodą. Jest to zgodny z prawami mechanizm aktualizacji zasobów statycznych, a nie obejście blokad.

## 6. Najważniejsze ograniczenia

- Nie ma dostępu do wszystkich sklepów ani katalogów zablokowanych prywatnie.
- Link do produktu nie oznacza dostępnego rozmiaru lub prawa do zdjęcia.
- Feed importowany raz nie zapewnia aktualnych stanów i cen.
- Wielu dostawców oznacza wielu niezależnych checkoutów i przesyłek.
- Aplikacja nie wykonuje zakupów ani płatności w imieniu użytkownika.
- Silnik stylizacji nie zastępuje generatywnego modelu zdjęciowego.


## Nowość 5.0

Catalog Radar i Catalog Sync są opisane w `docs/CATALOG_RADAR_5.md`. Wszystkie firmy i platformy mają stan kandydat, dopóki nie istnieje umowa i poprawnie zaimportowany feed. Brak automatycznej realizacji produkcyjnej.