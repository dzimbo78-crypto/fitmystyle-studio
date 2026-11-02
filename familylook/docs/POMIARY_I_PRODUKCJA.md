# FitMyStyle / FamilyLook Studio — instrukcja dla krawca i osoby mierzącej

## Założenia

Pomiar **sylwetki** i pomiar **gotowej odzieży** są różnymi wielkościami. Użytkownik wprowadza wymiary ciała w centymetrach, a aplikacja oblicza tylko przykładowe obwody odzieży z dodanym luzem konstrukcyjnym. Nie tworzymy automatycznie rzeczywistych wykrojów ani nie obiecujemy idealnego dopasowania.

Punkt odniesienia definicji antropometrycznych: [ISO 8559-1:2017](https://www.iso.org/standard/61686.html) — norma opisuje podstawy pomiarów, **nie zatwierdza** naszego oprogramowania ani przyjętych tutaj wartości luzu. Pomiary w aplikacji to autorskie, uproszczone instrukcje dla użytkownika.

## Jak przygotować pomiar

1. Miarka elastyczna, nie rozciągnięta, kartka i pomoc drugiej osoby.
2. Osoba w lekkim ubraniu lub odzieży, którą planuje nosić pod zamawianym produktem. Nie mierz przez grubą bluzę.
3. Wzrost bez obuwia; plecy proste; ręce opuszczone, naturalny oddech.
4. Mierz co najmniej dwa razy i wpisuj wynik z dokładnością do 0,5–1,0 cm, zależnie od odcinka i możliwości odczytu. Nie zaokrąglaj arbitralnie do tabeli rozmiarów.
5. Nie podawaj samego rozmiaru S, M, 110 czy 68 zamiast fizycznych pomiarów. Są to oznaczenia producenta, a nie samodzielne dane konstrukcyjne.
6. Przy pomiarach niemowlęcia pomiar wykonuj spokojnie, bez wymuszania pozycji. Jeśli nie da się zmierzyć bezpiecznie — pozostaw puste pole i skonsultuj z wykonawcą.

## Instrukcja dla każdej osoby

Aplikacja posiada 13 opisanych pól: wzrost, klatka/biust, talia, biodra, szyja, barki, długość rękawa, długość tułowia, obwód ramienia, nadgarstek, długość nogawki od kroku, długość nogawki zewnętrzna i obwód głowy. Każde pole ma własny krok, schemat i lokalizację na sylwetce.

Dobór wymaganych pól wynika z wybranego modelu. Koszula z rękawem wymaga szyi, rękawa i nadgarstka. Spodnie wymagają długości nogi i obwodów talii/bioder. Body niemowlęce nie jest równoważne bluzie dorosłej; wybór rozmiaru wymaga osobnej konstrukcji i rozwiązania zapięć.

## Wyniki i kontrola

Dla obwodów: **gotowy obwód = obwód ciała + założony luz**. Przykładowo 102 cm klatki i 17 cm luzu daje 119 cm planowanego obwodu bluzy. To nie oznacza wymiaru pojedynczej części wykroju: potrzebne są rozdziały na przód i tył, kształt pachy, barki, zapasy na szwy, rozciągliwość materiału i tolerancje.

Puste/odstające wartości wywołują ostrzeżenie. Krawiec potwierdza wszystkie wymiary, materiał, skurcz, rysunek technologiczny, próbkę i dopiero wtedy zatwierdza wyrób. Program nigdy nie zmienia pustych pomiarów na wymyślone dane.

## Kontrolna lista zawodowa przed krojeniem

- Potwierdzone pomiary każdej osoby; numer/kod projektu, nie pełna data urodzenia dziecka.
- Nazwa i numer szablonu, wydanie konstrukcji, wymiary części, tolerancje, gradacja i kierunek nitki.
- Próbka materiału: skład, kurczliwość w praniu, gramatura, rozciągliwość, kierunek włókien, stabilność koloru.
- Wykończenie: ściegi, rodzaj igły, rodzaj i zapas szwu dla elementu, miejsca wzmocnień, dekoracje.
- Rozmieszczenie nadruku sprawdzone dla każdej rozmiarówki osobno; drukarnia zatwierdza safe zone i format.
- Odzież dziecięca: osobna kontrola sznurków, małych elementów, zatrzasków i innych zagrożeń (m.in. EN 14682 dla sznurków).
- Przymiarka prototypu i pisemna zgoda konstruktora/wykonawcy.

## Prywatność i handel

Pomiar sylwetki i informacje o dzieciach mogą być informacjami szczególnie prywatnymi. Konta nie są aktywne bez odrębnego Supabase i reguł RLS. Bez konta zapis jest w sesji przeglądarki. Wysyłka do szwalni, płatności i drukarnie są odłączone. Zapytanie przez e-mail jest tylko ręcznie przygotowanym szkicem.

Dla przyszłej sprzedaży wymagane są poprawne informacje o składzie tekstyliów, dostawie, zwrotach, VAT, producencie i bezpieczeństwie wyrobu. Oznaczenie `DRAFT` nie może zniknąć bez fizycznej walidacji.