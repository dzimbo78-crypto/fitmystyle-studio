# Zakupy w Europie

Kraj zakupów określa wersję sklepu. Automatyczny dobór bierze produkty z wybranego rynku. Zamówienia z różnych wersji tego samego sklepu mają odrębne rezerwy na dostawę. Użytkownik ustala walutę budżetu. Karty pokazują oryginalne ceny i szacunkowe przeliczenie według datowanej tabeli NBP.

Katalog startowy łączy polskie oferty z odczytami z Danii, Niemiec, Francji, Hiszpanii i Szwecji. Każdy rekord zawiera link do źródła ceny i zdjęcia sklepu. Dla pozostałych krajów selektor otwiera lokalne witryny. Link do sklepu nie oznacza pokrycia kraju w katalogu ani potwierdzonej wysyłki.

## Odświeżanie

Publiczny workflow `FamilyLook public storefronts` jest uruchamiany o 03:23 i 15:23 UTC, na żądanie oraz po zmianach konfiguracji importu. Sprawdza publiczne karty i linki w wybranych działach. Czyta `robots.txt`, ogranicza liczbę żądań na domenę i przerywa odczyt przy blokadzie lub limicie. Data ceny zmienia się po odczycie konkretnej, jednoznacznej ceny w walucie rynku. Dostępne rozmiary pochodzą z jawnych wariantów produktu.

Zweryfikowane odczyty zapisują się w `familylook-catalog/retail-refresh.json` na osobnej gałęzi. Strona pobiera ten plik przy otwarciu i na żądanie. Przy niedostępności pliku nadal działa zapisany katalog. Brak nowej ceny pozostawia dotychczasową datę, a starsze ceny wymagają włączenia w preferencjach doboru.

Adresy sklepów pochodzą z ich lokalnych witryn, [wyboru kraju H&M](https://www2.hm.com/entrance.html) i [listy rynków Zalando](https://partner.zalando.com/university/article/platform-rules).
