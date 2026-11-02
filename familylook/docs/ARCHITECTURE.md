# FitMyStyle FamilyLook Studio — architektura krawiecka

## Dwie odrębne warstwy
1. **Baza fasonu** — 20 predefiniowanych konstrukcji podglądowych; dla nowego koloru lub nadruku nie generujemy nowego obrazu AI.
2. **Warstwy projektu** — paleta, materiał, fason, przynależność do grupy wiekowej, tekst i załączony obraz. Każdy członek rodziny ma osobne pomiary.

## Pomiar a konstrukcja
Dane `measurements` są wyłącznie obwodami i długościami **ciała** w cm. `calculateGarment` zwraca **robocze** cele wymiarów ubrania poprzez dodanie sugerowanego luzu. Luz nie jest zapasem na szew ani automatycznie wykonanym wykrojem. Długości rękawa i nogawek są zapisywane w dokumentacji, a ich końcowa wartość wymaga decyzji konstruktora (również mankiety i podwinięcia). 

## Techniczny pakiet dla krawca
Osobny arkusz A4 dla osoby: charakterystyka, fason, rodzaj materiału, pomiary ciała, brakujące dane, orientacyjne docelowe obwody, pole nadruku w mm, uwagi, ryzyka dla odzieży dziecięcej, miejsce zatwierdzenia. Export HTML → drukuj/zapisz do PDF; CSV pomiarów; JSON techniczny. Pomiary nie są udostępniane nikomu automatycznie.

## Grupy wiekowe
Dorośli: każdy rodzaj sylwetki (kobieta, mężczyzna, neutralna) bez automatycznych założeń o anatomii.
Dziecko: dopasowane fasony z katalogu; projekt sznurków przy kapturze wymaga kontroli według EN 14682.
Niemowlę: osobne body, pomiary wykonywane przy opiece dorosłego, bez ucisku, z minimalizacją zbędnych pomiarów i elementów potencjalnie niebezpiecznych.

## Proces komercyjny (jeszcze nieaktywny)
Pomiar → zatwierdzenie krawieckie → wykonanie próbki → kontrola wymiarów / kurczliwości → zatwierdzenie do produkcji → dopiero wtedy mapowanie wariantu producenta. Żaden obecny szablon nie jest automatycznie zatwierdzony do seryjnego szycia. Brak autoryzowanych SKUs, brak automatycznej wysyłki do szwalni, brak płatności.

## Ochrona danych
Tryb gościa: sessionStorage (zależne od przywracania kart przez przeglądarkę). Wersja Next/Supabase to kod startowy i migracja, a nie uruchomiony backend. RLS ogranicza dostęp do właściciela; serwer weryfikuje token użytkownika. Nie wprowadzamy publicznego magazynu skanów sylwetek. Dla kont online wymagane będą procedury retencji, usuwania, praw dostępu, obsługa RODO i regulamin.

## Standardy i źródła
ISO 8559-1:2017 definiuje terminy i zasady antropometrii dla odzieży. Wyświetlany opis pomiarów jest własnym skróconym przewodnikiem, **nie** reprodukcją pełnego tekstu standardu ani certyfikatem zgodności. W UE dla dziecięcej odzieży należy ocenić bezpieczeństwo sznurków wg odpowiedniej wersji EN 14682. Dodatkowo obowiązują prawa konsumentów i informacja o składzie włókien przed sprzedażą.