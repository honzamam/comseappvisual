# Produktový přehled a analýza produktu

## Srovnání produktů na úrovni e-shopu

Produktový přehled slouží ke srovnání produktů a jejich tržeb v rámci vybraného e-shopu. Klient vidí, které produkty se prodávají, jak přispívají k výsledkům obchodu a jaké mají náklady na reklamu. Produkty lze porovnávat i po jednotlivých variantách.

Část **Celoeshop** ukazuje obchodní výsledky produktu ze všech zahrnutých objednávek e-shopu. Vedle ní jsou samostatně výsledky Google Ads a Meta Ads. Tržby e-shopu se nezískávají součtem konverzních hodnot reklamních platforem, protože jejich přiřazení objednávek se může překrývat.

Srovnání zahrnuje tržby produktu, prodané kusy, zisk, PNO, sklad, storna a také:

- **Poskytnuto na slevách:** součet slev na daný produkt včetně jeho podílu na slevě celé objednávky. Objednávková sleva se nesmí v plné výši opakovaně přičíst každému produktu.
- **Průměrná hodnota objednávky s tímto produktem:** průměrná hodnota celého nákupu po slevách u objednávek obsahujících produkt. Každá objednávka se započítá jednou, i když obsahuje více kusů nebo variant produktu. Průměry jednotlivých produktů se nesčítají.

Objednávkové ukazatele se řídí vybraným obdobím, e-shopem a stavy objednávek, které si klient určuje pro příslušný pohled v nastavení. Produkty se porovnávají za stejných podmínek.

## Analýza konkrétního produktu

Detail produktu slouží k rozboru jeho výkonu v čase. Spojuje tržby a prodeje z e-shopu s dostupnými reklamními ukazateli a historií změn produktového feedu. Klient tak může sledovat, zda se výsledky produktu po úpravách zlepšují, zhoršují, nebo zůstávají podobné.

V grafu lze zapnout také **skladové zásoby**. Samostatná přerušovaná křivka používá pravou osu v kusech a ukazuje stav zásob produktu nebo vybrané varianty v daném čase, nikoli počet prodaných kusů. Hodnota pro vybraný bod se zobrazuje spolu s výkonovými ukazateli. Klient tak může při poklesu prodejů zohlednit docházející zásoby nebo při růstu opětovné naskladnění. Chybějící skladový údaj se ve výsledné aplikaci nesmí zaměnit za nulovou zásobu. Vizuál nyní používá pevnou květnovou ukázku s posledním stavem 48 ks; volba období zatím tato ukázková data nepřepočítává.

### Historie změn ve feedu

Zamýšlená aplikace při načtení feedu zaznamená změněné údaje konkrétního produktu nebo varianty, například název, popis, cenu, akční cenu, dostupnost, obrázek, kategorii a štítky včetně custom labelů.

U záznamu uchovává identifikátor produktu a e-shopu, změněné pole, původní a novou hodnotu, zdroj a čas zjištění změny. Pokud zdroj poskytuje skutečný čas úpravy nebo jejího autora, uloží se také; jinak se tyto údaje nevymýšlejí. Čas zjištění při importu se odlišuje od času úpravy v e-shopu a od případného potvrzení přijetí reklamní platformou.

Historie zůstává zachovaná i po dalších úpravách. Změny jsou označené na časové ose výkonu a jejich rozkliknutí ukáže, co se změnilo.

### Vyhodnocení před změnou a po ní

U vybrané změny klient porovná stejně dlouhá období před ní a po ní, například 7 dní před změnou a 7 dní po změně. Uvidí původní a novou hodnotu i absolutní a procentní rozdíl u tržeb, počtu objednávek obsahujících produkt, prodaných kusů, zisku, reklamních útrat, PNO a dostupných reklamních ukazatelů.

Vyhodnocení pojmenuje konkrétní výsledek: například „Tržby vzrostly o 12 %, PNO kleslo o 2 procentní body“. U PNO je pokles při jinak srovnatelných podmínkách příznivý; u tržeb a zisku růst. Pokud se ukazatele rozcházejí, uvede smíšený výsledek. Při nulové výchozí hodnotě nezobrazuje zavádějící procentní změnu a při krátkém období nebo nedostatku dat označí výsledek jako nedostatečný pro vyhodnocení.

Porovnání ukazuje vývoj po změně, samo o sobě však nedokazuje, že jej způsobila právě úprava feedu. Vedle výsledků mají být vidět souběžné změny, například další úprava produktu, výprodej, vyprodání zásob nebo změna reklamního rozpočtu, pokud jsou tyto informace dostupné.

## Rozsah současného vizuálu

COMSE APP VIZUAL je klikací prototyp s ukázkovými daty. Tato dokumentace popisuje zamýšlené fungování; skutečný import feedu, automatický zápis historie změn ani výpočet jejich dopadu zatím nejsou implementované.

Související dokumentace: [Přehled a jeho nastavení](prehled-a-nastaveni.md), [Výkon reklamních účtů](vykon-reklamnich-uctu.md), [Nastavení marží](nastaveni-marzi.md), [Hromadné úpravy feedu s Honzou](hromadne-upravy-feedu-s-honzou.md).
