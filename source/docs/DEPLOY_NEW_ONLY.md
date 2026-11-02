# FitMyStyle Studio 6 — w pełni niezależne wdrożenie

**Zakaz wykorzystania istniejących repozytoriów i usług Render.** Tylko nowy GitHub `fitmystyle-studio-v6` + nowa usługa `fitmystyle-studio-6-independent`.

1. Utwórz nowe repozytorium GitHub: https://github.com/new?name=fitmystyle-studio-v6. Zaznacz README, aby powstała gałąź `main`. Preferowane prywatne; sprawdź uprawnienia aplikacji Render/GitHub do nowego repo.
2. Wgraj **zawartość** folderu `fitmystyle-standalone` jako pliki głównego katalogu nowego repo (nie kopiuj żadnego starego projektu).
3. W Render wybierz **New → Static Site**, połącz wyłącznie NOWE repozytorium. Region nie jest istotny dla static CDN, a plan static pozostaje darmowy w limitach Render.
4. Build Command: `node --test tests/*.test.mjs && node scripts/build.mjs`; Publish Directory: `dist`; Branch: `main`. Lub użyj blueprint `render.yaml`.
5. Uruchom i potwierdź działanie pod nową domeną `onrender.com`. Sprawdź: menu, prywatna szafa, import, PDF/SVG, plan zakupowy, odświeżanie, PWA. Nie dodawaj płatności ani sekretów do statycznej strony.
6. **Nie** deklaruj aktywnych partnerstw, sklepów, płatności czy automatycznej produkcji bez realnej integracji.

W tej sesji repozytorium i serwis Render **nie zostały stworzone**: połączone narzędzie GitHub nie oferuje operacji założenia repozytorium, a Render wymaga repo do publikacji strony. Istniejące repozytoria i usługi pozostają nietknięte.