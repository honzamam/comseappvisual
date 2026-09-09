# Hromadné úpravy feedu s Honzou

Funkce umožňuje klientovi zadat úpravy více produktů běžnou větou. Najde ji ve Feedu pod tlačítkem **Hromadné úpravy s Honzou**. Honza pomáhá připravit návrhy textů; klient vidí jejich rozsah, zkontroluje je a rozhodne, které použije.

## Příklady zadání

- „Honzo, prosím zkrať popisky u všech produktů.“
- „Honzo, prosím zkrať názvy všech produktů a zachovej jejich označení.“
- „Honzo, prosím doplň do popisků všech produktů jejich použití podle známých údajů.“
- Pro budoucí plné napojení také například: „U běžeckých bot sjednoť popisky na nejvýše 280 znaků“ nebo „Doplň materiál tam, kde jej máme v parametrech a chybí v popisu“.

## Postup klienta

1. Otevře hromadné úpravy, napíše zadání nebo zvolí příklad.
2. Určí rozsah: všechny produkty daného feedu nebo vybranou kategorii. „Všechny“ se vztahuje k otevřenému feedu, ne ke všem firmám a e-shopům účtu. Před přípravou návrhů musí být zřejmé, kterého feedu, kolika produktů a jakých atributů se úprava týká. Pokud si text zadání a zvolený rozsah odporují, je potřeba je sjednotit.
3. Honza připraví náhled. U každého produktu je původní hodnota a navrhovaná hodnota vedle sebe.
4. Klient může návrh ručně upravit a schválit, nechat jej neschválený nebo schválit všechny zobrazené návrhy najednou.
5. Samostatným tlačítkem potvrdí jen schválené úpravy. Prázdná nebo nezměněná hodnota se nepovažuje za úpravu k použití.

Změna zadání nebo rozsahu zneplatní předchozí návrhy a jejich schválení. Ruční editace návrhu zruší schválení daného produktu, aby klient potvrzoval aktuální text.

## Jak mají návrhy vznikat v napojené aplikaci

Honza má zachovat identitu produktu a ověřené vlastnosti. Materiál, rozměry, použití, certifikace či jiné parametry doplňuje pouze tehdy, pokud je má v dostupných podkladech. Chybějící informaci označí k doplnění; nevymýšlí ji. Nejasné zadání nejprve upřesní a nezmění tiše rozsah úprav.

Zadání ke změně popisků neopravňuje ke změně ceny, skladu ani jiných nesouvisejících atributů. Návrh se automaticky nezapisuje do zákazníkova e-shopu. V plné aplikaci musí být před potvrzením jasné, kde se změny projeví, například v upraveném výstupním feedu COMSE.

Při budoucím skutečném použití se zaznamená zadání, rozsah, původní a nová hodnota, autor potvrzení a čas. Historie změn se propojí s [produktovou analýzou](produktova-analyza.md), aby klient mohl sledovat následný vývoj výkonu. Samotné zlepšení po úpravě ještě nedokazuje, že jej způsobila právě tato změna.

Hromadné textové úpravy jsou jednorázové zadání. Průběžné přehodnocování labelů podle výkonu se nastavuje samostatně v **Pravidlech labelů**.

## Co umí současný vizuál

Klikací prototyp obsahuje tři syntetické produkty. Ukazuje výběr všech tří nebo kategorie Běžecké boty či Batohy, vložení příkladů, připravené ukázky zkrácení popisků a názvů nebo doplnění použití. Rozpoznává omezené typy zadání podle klíčových slov; není to obecné porozumění libovolnému příkazu ani skutečné generování AI. Konkrétní vlastní limity či složité podmínky se zatím nevyhodnocují.

Návrhy lze upravit, schválit jednotlivě či hromadně a potvrdit v ukázce. Potvrzení zobrazí zprávu a ukončí daný náhled. Nezapisuje skutečný feed, nevolá AI, neodečítá kredity a neukládá trvalou historii. Počet tří ukázkových produktů není počet produktů skutečného napojeného feedu.
