# AI kredity u účtu

Stav: návrh pro COMSE APP VIZUAL. Klikací ukázka, bez skutečných plateb a AI volání. Přehled je v Nastavení → AI kredity, zůstatek také v levém menu jednotlivých obrazovek aplikace.

## Navržený model

- Peněženka kreditů patří účtu firmy. V ukázce jde o syntetickou Firmu Alfa.
- E-shopy a zaměstnanci čerpají ze společného firemního zůstatku. Výběr e-shopu nemění vlastníka kreditů.
- Každé čerpání eviduje datum, účel, uživatele, e-shop a počet kreditů.
- Majitel firmy řídí dobití a přístupy k používání AI. Správa kreditů a použití AI mají být oddělená oprávnění; zde jde pouze o návrh, nikoli vynucování oprávnění.
- Marketingová agentura může použít účet klienta jen s jeho pověřením. Peněženky různých firem se neslučují. Pro vlastní práci agentury lze použít její vlastní firemní účet.
- Před AI akcí má být jasně uveden účet a spotřeba kreditů. Bez dostatečného zůstatku akce nezačne.

Navazuje na [typy účtů a oprávnění](typy-uctu-a-opravneni.md).

## Co je v klikací ukázce

Výchozí historie obsahuje připsání 1 500 kreditů a čerpání 200 + 60 kreditů. Dostupný zůstatek je 1 240 kreditů.

Dialog dobití přidá 500 **ukázkových** kreditů. Testovací tlačítko odečte 20 kreditů za ukázku AI doporučení pro E-shop 2 pod uživatelem Zaměstnanec X. Obě akce doplní historii a aktualizují zůstatek. Při nedostatku kreditů se odečet zablokuje; pod 100 kredity se zobrazí upozornění. Neprovádí se skutečné doporučení ani účtování.

Ukázkový stav je uložen pouze v sessionStorage této karty prohlížeče, aby se zůstatek zachoval při přecházení mezi stránkami. Tlačítko „Obnovit ukázku“ obnoví výchozí data. Při nedostupném úložišti změny fungují pouze v paměti stránky a uživatel o tom dostane zprávu. Existující AI ovládací prvky jinde v prototypu zatím nejsou připojené k odečítání.

## Před skutečným zavedením dořešit

- Cenu balíčků, převod peněz na kredity a spotřebu podle AI akce. Čísla v prototypu jsou ilustrační; kredit není Kč ani token provideru.
- Kredity zahrnuté v tarifu, případnou expiraci, převádění do dalších období a refundace. Ukázka žádné z těchto pravidel nepředpokládá.
- Limity čerpání pro zaměstnance a e-shopy, přehled historie podle oprávnění a případné použití vlastní peněženky agentury pro klienta.
- Serverové rezervace před spuštěním, ochranu proti dvojímu odečtu při retry, souběhu a opakovaném kliknutí, vypořádání skutečné spotřeby a vrácení rezervace podle výsledku. SessionStorage není zabezpečený účetní ani přístupový systém.
- Jednoznačné chování při chybě AI a nejasném výsledku. Kredity samy o sobě nejsou zárukou limitu nákladů externího provideru.

## Vztah k nákladům společnosti

Nákup kreditů a jejich čerpání nejsou automaticky dva peněžní náklady. Před propojením s [náklady společnosti](naklady-spolecnosti.md) je potřeba definovat jediné pravidlo vykázání a rozdělení nákladu mezi e-shopy. Vizuál žádný finanční náklad za kredity automaticky nevytváří.

## Honza AI na všech stránkách

Plovoucí chat Honza AI je dostupný na všech HTML stránkách vizuálu, včetně přihlášení. Používá připravené lokální odpovědi na témata kreditů, nákladů, PNO, produktů a přístupů. Nevolá AI, nečerpá kredity a zprávy nikam neodesílá ani neukládá do úložiště. Konverzace zůstává jen v paměti aktuální stránky. Jde o ukázku budoucího rozhraní; žádné přihlášení ani datová oprávnění se tím nezavádějí.
