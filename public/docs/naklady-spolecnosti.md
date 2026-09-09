# Base — Náklady společnosti

Stav: návrh produktu a klikací vizuál COMSE APP VIZUAL. Pouze syntetické údaje, žádné skutečné platby ani napojení na účetnictví. Ukázka je v `company-costs.html`, vstup z Nastavení → Base · Finance → Náklady společnosti.

## Co chceme uživateli ukázat

Každý náklad má vlastní firmu a jednoznačné přiřazení. Zaměstnanec X pracující pouze pro E-shop 2 zatěžuje pouze E-shop 2. Firemní výsledek obsahuje všechny náklady dané firmy právě jednou.

Přístup zaměstnance do aplikace a přiřazení jeho nákladu jsou dvě nezávislé věci. Zaměstnanec může mít přístup do více e-shopů, ale jeho náklad rozdělujeme podle skutečné práce, nikoli automaticky podle oprávnění.

## Pole nákladu

| Pole | Význam |
| --- | --- |
| Firma | Povinný vlastník záznamu. V ukázce pevně zvolená syntetická Firma Alfa. |
| Název | Např. Zaměstnanec X, software nebo nájem kanceláře. |
| Částka a měna | Kladná částka, v ukázce CZK s přesností na haléře. |
| Typ | Lidé a externisté; software a nástroje; nájem a provoz; logistika; agentury a služby; ostatní. |
| Období nákladu | Měsíc, do kterého náklad vstupuje ve finančním vyhodnocení. |
| Splatnost | Kdy má být částka zaplacena. |
| Datum platby | Skutečný den úhrady; povinný u zaplaceného nákladu. Nezaplacený náklad jej nemá. |
| Stav | Čeká na platbu / zaplaceno. |
| Přiřazení | Nerozdělená režie firmy / konkrétní e-shop / rozdělení mezi e-shopy téže firmy. |
| Podíly | U sdíleného nákladu procenta se součtem 100 %. V ukázce dva e-shopy a celá procenta. |
| Opakování | Jednorázově / měsíčně / ročně. V ukázce pouze označení, bez generování dalších položek. |
| Poznámka | Např. účel výdaje nebo zdůvodnění rozdělení podle odpracovaných hodin. |

U zaměstnanců chceme evidovat celkový náklad firmy, nejen čistou mzdu. Konkrétní obsah částky musí být před zavedením do reálného vyhodnocení sjednocen.

## Přiřazení a dopad

1. **Přímý náklad e-shopu:** 100 % na vybraný e-shop. Ostatní e-shopy beze změny.
2. **Sdílený náklad:** rozdělení podle explicitních podílů. Základem mohou být hodiny, počet lidí nebo jiný dohodnutý klíč. V první ukázce se procenta zadávají ručně; žádný automatický odhad.
3. **Firemní režie:** nepromítá se do jednotlivých e-shopů, snižuje pouze výsledek firmy. Souhrn ji viditelně uvádí, aby součet výsledků e-shopů nebyl zaměňován za výsledek firmy.

Rozdělení pracuje s celými haléři. Podíl prvního e-shopu se zaokrouhlí, druhý dostane zbytek. Součet podílů se vždy rovná původní částce. Firma sčítá původní náklady jednou, nikoli původní náklad plus jeho podíly.

### Ukázka za září 2026

| Náklad | Firma bez rozdělení | E-shop 1 | E-shop 2 | Celkem |
| --- | ---: | ---: | ---: | ---: |
| Zaměstnanec X | 0 Kč | 0 Kč | 48 000 Kč | 48 000 Kč |
| Expedice a balení | 0 Kč | 12 000 Kč | 0 Kč | 12 000 Kč |
| Týmový software 50 / 50 | 0 Kč | 3 000 Kč | 3 000 Kč | 6 000 Kč |
| Nájem kanceláře 50 / 50 | 0 Kč | 10 000 Kč | 10 000 Kč | 20 000 Kč |
| Celkem | 0 Kč | 25 000 Kč | 61 000 Kč | 86 000 Kč |

| Pohled | Ukázkový výsledek po reklamě | Náklady | Výsledek po nákladech |
| --- | ---: | ---: | ---: |
| E-shop 1 | 95 000 Kč | 25 000 Kč | 70 000 Kč |
| E-shop 2 | 72 000 Kč | 61 000 Kč | 11 000 Kč |
| Firma včetně režie | 167 000 Kč | 86 000 Kč | 81 000 Kč |

Jde o manažerský příklad, nikoli účetní čistý zisk. Výchozí výsledky jsou samostatná syntetická data. Průběžný zisk na dashboardu se s nimi shoduje k poslednímu dni měsíce. Nenavazují na původní marketingové karty za rozsah dnů. Pro jiný měsíc ukázka vypočte evidované náklady, ale bez výchozího výsledku nezobrazí domnělý zisk.

## Období není datum úhrady

Zářijový náklad zaměstnance zaplacený v říjnu patří do zářijového výsledku a říjnových peněžních výdajů. Stav „čeká na platbu“ nevyřazuje náklad z finančního výsledku.

Měsíční souhrn na stránce Náklady společnosti zobrazuje celkový zisk (při záporné hodnotě ztrátu) po odečtení všech nákladů daného měsíce. Náklady rozděluje do čtyř vzájemně výlučných skupin:

- **Uhrazeno:** zaplacené náklady zvoleného měsíce bez ohledu na datum úhrady.
- **Splatné v tomto období:** neuhrazené náklady se splatností v měsíci nákladu.
- **Platby v dalších obdobích:** neuhrazené náklady se splatností po zvoleném měsíci, včetně více vzdálených měsíců.
- **Splatné v dřívějších obdobích:** neuhrazené náklady se splatností před zvoleným měsícem. Jde o porovnání období, nikoli označení prodlení vůči dnešnímu dni.

Součet čtyř skupin odpovídá celkovým nákladům. „Zbývá uhradit“ sčítá tři neuhrazené skupiny. Změna stavu úhrady nemění finanční výsledek. Rozpis obsahuje pouze náklady zvoleného měsíce, nikoli všechny závazky splatné v budoucnu. Není to bankovní zůstatek ani přehled cash flow podle data platby.

Na hlavním přehledu má karta průběžného zisku a tabulka plateb jedno společné datum. Nemění se přepnutím Marketing / Finance ani horním rozsahem dnů. Reagují na výběr e-shopu. Stránka nákladů přepočítává výsledek při místním přidání/odebrání položky a umožňuje filtrovat tabulku i podle platební skupiny. Změny nákladů se ukládají do sessionStorage této karty prohlížeče. Dashboard i grafy při návratu načtou stejné položky.

## Firmy, agentury a přístupy

Navazuje na [Typy účtů a oprávnění](typy-uctu-a-opravneni.md). Majitel firmy řídí přístup k nákladům. Prohlížení financí a správa nákladů mají být samostatná oprávnění. Přístup do reklamních účtů automaticky nezpřístupní personální náklady.

Agentura pracuje s klientskými náklady pouze v rozsahu pověření. Každý záznam patří jedné firmě; nelze jej rozdělit mezi e-shopy různých klientských firem. Vlastní náklady agentury a její faktury klientům nejsou tentýž záznam. Případné propojení s konkrétním zaměstnancem musí respektovat citlivost personálních dat.

## Co ještě dává smysl doplnit

- Dodavatel / příjemce, číslo dokladu a příloha pro dohledatelnost.
- Plánovaný vs. skutečný náklad, rozpočet a upozornění na blížící se splatnost.
- Editace s historií, autor změny a schvalování před zahrnutím do uzavřeného období. Mazání skutečných nákladů nenahradí auditní historii.
- Časová platnost rozdělení: změna práce zaměstnance od října nesmí tiše přepsat září.
- Rozpočítání ročních plateb do měsíců a opakované šablony s počátkem a koncem. Roční označení v ukázce zatím celou částku přiřadí jednomu zvolenému měsíci.
- Rozdělení podle hodin a případně podle tržeb; vždy s viditelným základem a schváleným pravidlem.
- Částečné úhrady, dobropisy a peněžní toky jako samostatné události, bez dvojího započtení nákladu.
- Jednotná práce s DPH, měnami a kurzy. Ukázka DPH nepočítá a podporuje pouze CZK; před skutečným propojením je nutné definovat jednotný základ.
- Identifikace nákladů již zahrnutých v marži, logistice nebo reklamě, aby nebyly odečteny podruhé. Přímé reklamní výdaje z Meta/Google sem automaticky nepřidávat, pokud je už obsahuje výsledek po reklamě.

## Rozsah hotového vizuálu

Funguje lokální přidání a odebrání ukázkového nákladu, výběr období, výběr e-shopu, filtr podle typu, procentní rozdělení a přepočet dopadu. Při přidání se zobrazí firemní souhrn za období nového nákladu, aby byl záznam ihned viditelný. Filtry typu a platební skupiny omezují tabulku, nikoli horní finanční souhrn.

Záznamy jsou lokální v této kartě prohlížeče a přežijí obnovení i přechod na dashboard. Tlačítko Obnovit ukázku vrátí původní položky. Při nedostupném úložišti se zobrazí upozornění a změny platí pouze na aktuální stránce. Formulář nic neodesílá. V tomto vizuálu nejsou implementovány skutečné účty, oprávnění, účetnictví, automatické opakování, přílohy ani platby.

## Jedna karta zisku a samostatný přehled plateb

Na dashboardu je jedna hlavní částka: **Zisk po nákladech** od začátku měsíce do data zvoleného v kartě. Pod částkou jsou jen dva řádky výpočtu: zisk po reklamě a průběžně započtené náklady. Vzorec a vysvětlení jsou ve sbaleném detailu. Původní druhý souhrn celoměsíčního zisku byl z dashboardu odstraněn, aby nekonkuroval průběžnému výsledku. Celoměsíční detail zůstává v Nákladech společnosti.

Jedno datum „Stav k datu“ a výběr e-shopu řídí kartu zisku i tabulku plateb pod ní. Horní filtr reklamního výkonu je samostatný. Volba například 15. 9. 2026 znamená výsledek od 1. do 15. září včetně a stav úhrad k 15. září.

**Započtené měsíční náklady = měsíční částka × pořadí dne / počet dní v měsíci.**

Příklad: 30 000 Kč × 15 / 30 = 15 000 Kč. V 31denním měsíci je to 14 516,13 Kč. Výpočet respektuje přestupný únor a poslední den odečte celou částku. Zaokrouhlení probíhá na haléře nad součtem nákladů daného rozsahu. Rozpouštění platí pro měsíční položky, ostatní položky jsou v ukázce zahrnuté v plné výši v přiřazeném měsíci. Datum plnění jednorázových a ročních výdajů zůstává k dořešení před skutečným zavedením.

Pod kartou je **Co už odešlo a co nás čeká**:

- Uhrazeno: náklady s evidovaným datem úhrady do zvoleného dne včetně.
- Zbývá zaplatit: součet všech dosud neuhrazených položek, včetně těch po splatnosti; doplněný nejbližší budoucí splatností.
- Z toho po splatnosti: podmnožina částky k úhradě, nikoli další náklad k přičtení.

Tabulka obsahuje název výdaje, přiřazení, splatnost, částku a stav. Lze přepnout K úhradě / Uhrazené / Všechny, výchozí pohled ukazuje očekávané platby. Řádky jsou seřazené podle splatnosti a mají součet podle aktivního filtru. Budoucí datum úhrady nezpůsobí, že se výdaj zobrazí zaplacený před tímto datem.

Zahrnuty jsou pouze položky nákladového měsíce určeného zvoleným datem; jejich splatnost může být i v dalších měsících. Nejde o bankovní zůstatek ani úplnou cashflow projekci s příjmy a všemi závazky. Částky plateb se od zisku znovu neodečítají. Změna stavu úhrady nemění poměrně započtený náklad.

Syntetická ukázka celé firmy k 15. září: 81 000 Kč po reklamě − 43 000 Kč průběžných nákladů = **38 000 Kč zisku**. Uhrazeno 18 000 Kč, zbývá zaplatit 68 000 Kč, po splatnosti 0 Kč. Tabulka ukáže nájem 20 000 Kč se splatností 20. září a zaměstnance X 48 000 Kč se splatností 15. října.

Zisky pocházejí z ukázkové denní řady za září 2026. Pro jiný měsíc se zobrazí chybějící data, nikoli odhad zisku. K poslednímu dni řada odpovídá celoměsíčnímu příkladu 95 000 Kč po reklamě pro E-shop 1 a 72 000 Kč pro E-shop 2. Jde stále o lokální vizuál bez bankovního či účetního napojení.

## Sčítání e-shopů ve vizuálu

Pro přehlednou ukázku jsou nyní software i nájem rozdělené 50 / 50 mezi oba e-shopy. Všechny výchozí náklady jsou přiřazené, takže souhrn odpovídá přesně součtu E-shopu 1 a E-shopu 2. Při zadání nového nákladu pouze na firmu se nadále použije pravidlo samostatné firemní režie.

K 15. září: E-shop 1 má 46 500 Kč po reklamě − 12 500 Kč nákladů = 34 000 Kč; E-shop 2 má 34 500 Kč − 30 500 Kč = 4 000 Kč. Souhrn = 38 000 Kč.

## Záložky Tržby / Zisk po nákladech / Cashflow

V hlavním bloku Souhrn výkonu jsou tři záložky, které mění hlavní částku i graf. Tržby zachovávají sedmidenní ukázku a přepínač Marketing / Finance. Zisk a cashflow jsou měsíční pohledy podle data v kartě Zisk po nákladech; jejich období je výslovně uvedené. Výběr e-shopu platí ve všech záložkách.

- Zisk: kumulativní výsledek od prvního dne měsíce po reklamě a poměrné části nastavených měsíčních nákladů. Ostatní náklady jsou podle pravidel ukázky v plné výši přiřazeného měsíce.
- Cashflow: plán kumulativního pohybu peněz od nuly, včetně příjmů, nákupu zboží, reklamy a plateb evidovaných nákladů. Zobrazuje i platby nákladů jiného období, pokud jejich platba či splatnost připadá do zobrazeného měsíce. Uhrazené výdaje používají datum platby; ostatní splatnost. Budoucí část křivky za vybraným dnem je přerušovaná.
- Cashflow není bankovní zůstatek. Předpokládá včasné placení zbývajících položek; na neuhrazené výdaje po splatnosti se upozorní. Graf zůstává plánem, ne důkazem platby. Náklad se znovu nerozpouští na dny ani se neodečítá podruhé.

Inkaso je syntetické: opakuje se sedmidenní finanční řada ve dvojnásobném objemu jako měsíční scénář. Nákup zboží a reklama jsou v ukázce uhrazené ve stejný den; jejich součet vychází z rozdílu inkasa a denního výsledku po reklamě. Není to napojení banky ani skutečná předpověď. Pro měsíce bez ukázkové příjmové řady se zobrazí chybějící data.

Zaokrouhlení průběžných nákladů se rozdělí mezi e-shopy a případnou firemní režii podle zbytků haléřů, aby se denní souhrny přesně sčítaly. Karta zisku i graf používají stejné pravidlo.
