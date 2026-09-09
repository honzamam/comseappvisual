# Nastavení marží

Samostatná stránka `margin-settings.html`, dostupná z Nastavení i rychlých akcí Přehledu. Slouží k nastavení procentní marže podle kategorie a jednotlivého produktu, v rozsahu zvoleného e-shopu. „Všechny e-shopy“ umožní společnou změnu pro oba ukázkové e-shopy.

Marže je podíl hrubého zisku na prodejní ceně, nikoli přirážka k nákupní ceně. Při ceně 1 000 Kč a marži 49 % činí hrubý zisk 490 Kč před reklamou a provozem. Povolený rozsah je 0–100 %, až dvě desetinná místa. Před skutečným finančním nasazením je třeba sjednotit základ ceny a práci s DPH.

## Marže z e-shopu a vlastní nastavení

**Marže se načítají z připojeného e-shopu, pokud je e-shop poskytuje a dané napojení jejich přenos podporuje.** Klient je tak nemusí znovu zadávat do COMSE.

Pokud marže v e-shopu nejsou dostupné, klient si je může nastavit v COMSE podle kategorie, kombinace výrobce a kategorie nebo jednotlivě u produktu. Vlastním nastavením může také přepsat importovanou marži pro potřeby vyhodnocení v COMSE.

Importovaná hodnota a vlastní nastavení se uchovávají odděleně. Další synchronizace aktualizuje hodnotu z e-shopu, ale nesmaže vlastní nastavení klienta. Po odebrání příslušných vlastních pravidel se znovu použije dostupná marže z e-shopu. Nastavení v COMSE samo o sobě nepřepisuje marži ani cenu ve zdrojovém e-shopu.

U produktu má být vidět použitá marže a její zdroj: **Z e-shopu / Kategorie / Výrobce + kategorie / Vlastní marže**. Pokud není dostupná importovaná hodnota ani vlastní pravidlo, zobrazí se „Marže není nastavena“. Chybějící hodnota se nesmí zaměnit za výslovně nastavenou marži 0 %.

Jde o popis zamýšleného napojení. Současný klikací vizuál používá syntetická data a skutečné stahování marží z e-shopu zatím neprovádí.

## Pořadí pravidel

1. Individuální marže konkrétního produktu.
2. Pravidlo pro kombinaci výrobce a kategorie v daném e-shopu.
3. Vlastní marže kategorie v daném e-shopu.
4. Marže načtená z e-shopu, pokud ji nepřekrývá vlastní nastavení.
5. Bez dostupné hodnoty: „Marže není nastavena“.

V seznamu je vždy vidět použitá hodnota i zdroj. „Použít pravidlo“ odstraní individuální výjimku a použije další dostupný zdroj podle uvedeného pořadí. Různé hodnoty kategorie při zobrazení obou e-shopů se označí jako různé, neprůměrují se. Změna kategorie nepřepíše nadřazená pravidla.

## Honza AI – návrh hromadné změny

Tlačítko otevře modální okno se zadáním například:

> Nastav mi u výrobce X a kategorie Trička marži na 49 %.

Klikací simulace rozpoznává výrobce X/Y, kategorie Trička/Mikiny/Boty a jednu procentní hodnotu. Neznámé či nejednoznačné zadání vyžádá upřesnění. Nevolá AI a nečerpá kredity.

Před potvrzením ukáže rozsah, dotčené produkty a jejich původní a výsledné marže. Individuální výjimky zůstávají zachované. Volba „Přepsat i vlastní marže dotčených produktů“ je explicitně odstraní, aby se uplatnilo nové pravidlo. Žádná změna se nepoužije při pouhém vytvoření náhledu. Změna zadání, volby přepisu, rozsahu nebo pravidel náhled zneplatní.

Potvrzení vytvoří/aktualizuje pravidlo výrobce + kategorie pro e-shopy s odpovídajícími ukázkovými produkty. Nedotkne se jiných kategorií, výrobců ani e-shopů. Pravidlo lze odebrat v samostatném přehledu.

## Rozsah prototypu

Všechna data jsou syntetická. Změny jsou v paměti stránky, obnovením se vrátí výchozí ukázka. Nezapisuje se do skutečného e-shopu. Prodejní ceny lze upravit pouze v této ukázce. Přehled zatím své metriky podle těchto marží nepřepočítává. Účel a vazba na klientem volené stavy objednávek jsou v [popisu Přehledu](prehled-a-nastaveni.md).

## Samostatná stránka a výběr produktů

Ve stránce Nastavení je pouze odkaz na Nastavení marží. Vlastní editor je na samostatné adrese `margin-settings.html`. Produkty jsou hlavní pracovní část stránky; pravidla kategorií zůstávají níže.

Filtry lze kombinovat: název nebo SKU, kategorie, výrobce, vlastní/zděděná marže a e-shop v navigaci. Tlačítko „Označit vyfiltrované“ označí právě odpovídající produkty. Jednotlivé řádky lze přidat či odebrat checkboxem. Změna filtru nebo e-shopu označení zruší; akce nesmí zasáhnout skryté produkty.

„Nastavit marži označeným“ otevře modální náhled s vybranými produkty, původní a novou procentní marží. Po potvrzení nastaví individuální marži pouze označeným produktům. Hromadná akce nemění prodejní ceny ani pravidla kategorií. Bez výběru je tlačítko neaktivní.

Tabulka ukazuje prodejní cenu v Kč, aktuálně použitou marži a její zdroj. Prodejní cenu a individuální marži lze upravit přímo v řádku a potvrdit tlačítkem „Uložit řádek“. Prázdná individuální marže znamená použití dalšího dostupného pravidla; v cílovém napojení může jít i o marži z e-shopu. Cena je v ukázce od 0 do 10 000 000 Kč s přesností na haléře. Rozepsané změny řádků se zachovávají při filtrování na této stránce, ale do hodnot se promítnou až po uložení.

Návrh Honzy AI zůstává samostatnou cestou: řídí se textovým zadáním a rozsahem e-shopu, ne checkboxy ruční hromadné úpravy. Neprovádí skutečné AI volání. Všechny změny cen a marží jsou pouze lokální ukázkou do obnovení stránky.
