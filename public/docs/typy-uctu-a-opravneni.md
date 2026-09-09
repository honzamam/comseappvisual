# Typy účtů, firmy, e-shopy a oprávnění

Projekt: **COMSE APP VIZUAL**  
Datum: **9. 9. 2026**  
Stav: **produktové zadání pro budoucí aplikaci**

Tento dokument popisuje, jak mají později fungovat účty a přístupy. Současný web je klikací vizuál. Zobrazené role nejsou skutečně vynucovaná oprávnění a nevytvářejí uživatelské účty, pozvánky ani napojení agentur.

## 1. Základní zadání

- Aplikace má dva základní typy zákaznických účtů: **majitel e-shopu / firmy** a **marketingová agentura**.
- **Majitel firmy je nejvyšší účet v rámci své firmy.** Má konečné slovo při správě firmy, jejích e-shopů a přístupů.
- Každá firma může mít **více e-shopů**.
- Marketingová agentura může spravovat **více firem**. Každá z těchto firem může mít více e-shopů.
- Majitel firmy i marketingová agentura mohou spravovat **vlastní zaměstnance**.
- Každému zaměstnanci určují, ke kterým firmám, e-shopům a konkrétním částem aplikace má přístup a co v nich může dělat.

## 2. Typ zákaznického účtu a role člověka jsou dvě různé věci

**Typ účtu** určuje, zda aplikaci používá přímo firma provozující e-shopy, nebo agentura spravující klientské firmy. **Role** určuje pravomoci konkrétního přihlášeného člověka uvnitř dané organizace.

| Typ zákaznického účtu | K čemu slouží | Nejvyšší role v organizaci | Další členové |
| --- | --- | --- | --- |
| Majitel e-shopu / firmy | Správa vlastní firmy a jejích e-shopů | Majitel firmy | Zaměstnanci firmy s přidělenými přístupy |
| Marketingová agentura | Správa pověřených klientských firem a jejich e-shopů | Majitel agentury | Zaměstnanci agentury s přidělenými přístupy |

Ve firemním účtu používáme přesnější označení **Majitel firmy**, protože oprávnění pokrývají všechny její e-shopy. „Majitel e-shopu“ zůstává srozumitelné označení typu účtu například při vstupu do aplikace.

Majitel agentury řídí svou agenturu a její tým. **Nestává se tím majitelem klientských firem a není nadřazen jejich majitelům.** U klienta platí rozsah správy povolený majitelem dané firmy.

## 3. Hierarchie a vztahy

```text
FIRMA ALFA
├── Majitel firmy — nejvyšší oprávnění v této firmě
├── Zaměstnanci firmy — každý má vlastní přidělený rozsah
├── E-shop Alfa CZ
└── E-shop Alfa SK

MARKETINGOVÁ AGENTURA
├── Majitel agentury
├── Zaměstnanci agentury
└── Pověřená správa klientských firem
    ├── Firma Alfa — má svého majitele
    │   ├── E-shop Alfa CZ
    │   └── E-shop Alfa SK
    └── Firma Beta — má svého majitele
        └── E-shop Beta CZ
```

Vztah agentury k firmě znamená **pověřenou správu, nikoliv vlastnictví firmy**. Firma musí zůstat samostatně spravovatelná svým majitelem také po ukončení spolupráce s agenturou.

## 4. Role a jejich pravomoci

| Role | Spravuje zaměstnance | Rozsah dat a funkcí | Kdo určuje její oprávnění |
| --- | --- | --- | --- |
| Majitel firmy | Ano, tým vlastní firmy | Celá vlastní firma a její e-shopy | Nejvyšší role této firmy |
| Zaměstnanec firmy | Pouze pokud mu je správa týmu výslovně přidělena | Vybrané e-shopy a části aplikace vlastní firmy | Majitel firmy nebo pověřený správce |
| Majitel agentury | Ano, tým vlastní agentury | Klientské firmy a e-shopy v rozsahu pověření | Majitel příslušné klientské firmy omezuje klientský rozsah |
| Zaměstnanec agentury | Pouze pokud mu je správa týmu výslovně přidělena | Jen přidělení klienti, e-shopy, části aplikace a akce | Vedení agentury, nejvýše v rozsahu jejího pověření |

**Pověřený správce** je návrh rozšiřitelného oprávnění pro zaměstnance, nikoliv další typ zákaznického účtu. Pokud tato možnost nebude potřeba, správu týmu ponecháme pouze majiteli.

## 5. Jak se přiděluje přístup

Při nastavování člena týmu se mají odděleně volit:

1. **Člověk a jeho organizace:** zaměstnanec firmy nebo zaměstnanec agentury.
2. **Firma:** například Firma Alfa. U agentury může jít o více klientských firem.
3. **E-shop:** všechny výslovně přidělené e-shopy firmy, nebo jen vybrané.
4. **Část aplikace:** například Produkty, Reklamní účty, Feed nebo Fakturace.
5. **Povolené akce:** co přesně může člověk v této části dělat.

### Návrh úrovní oprávnění

| Oprávnění | Význam |
| --- | --- |
| Zobrazit | Číst data dané části aplikace |
| Upravovat | Měnit povolené údaje nebo připravovat návrhy |
| Schvalovat / spouštět | Potvrdit návrh nebo provést konkrétní povolenou akci, pokud ji daná část podporuje |
| Spravovat přístupy | Přidělovat nebo odebírat přístupy dalším členům v povoleném rozsahu |

Tyto úrovně jsou doporučené upřesnění zadání. Ne všechny části aplikace potřebují všechny akce. Oprávnění ke čtení samo o sobě nepovoluje úpravy, publikování, placené operace ani správu dalších lidí.

### Části aplikace, které mají mít samostatné přístupy

| Oblast | Příklady samostatně řízených přístupů |
| --- | --- |
| Přehled a výkon | Souhrnné výsledky, metriky jednotlivých e-shopů |
| Reklamní účty | Meta, Google, přidělené reklamní účty a kampaně |
| Produkty | Produktový přehled, detail, štítky |
| Slevy | Přehled slev, úpravy dostupných nastavení |
| Feed | Zobrazení, úpravy XML parametrů, pravidla |
| Doporučení a Honza AI | Chat, doporučení, návrhy a jejich schválení |
| Reporty | Zobrazení, export a případné sdílení |
| Finance | Marže a finanční výsledky |
| Fakturace | Předplatné, faktury a platební údaje |
| Napojení | Nastavení integrací a reklamních účtů |
| Firma a tým | Firemní údaje, zaměstnanci a přidělování oprávnění |

Přístup k marketingovým výsledkům nemá automaticky zpřístupnit marže, fakturaci nebo správu integrací. Honza AI má respektovat stejná oprávnění jako přihlášený člověk.

## 6. Doporučená pravidla pro budoucí implementaci

- Nový zaměstnanec začíná bez přístupů, dokud je správce výslovně nepřidělí.
- Nikdo nesmí přidělit širší přístup, než sám smí spravovat. Agentura nepředá svému zaměstnanci práva nad rámec pověření od klienta.
- Majitel firmy určuje, ke kterým e-shopům a částem aplikace má agentura přístup, a může jí pověření odebrat.
- Odebrání pověření agentuře odebere odpovídající přístup také jejím zaměstnancům. Případný samostatný přístup člověka jako zaměstnance firmy je jiný vztah a musí být zobrazen odděleně.
- Agentura spravuje svůj tým; bez zvláštního pověření nespravuje interní zaměstnance klienta.
- Přidání nového e-shopu nebo klientské firmy samo o sobě nerozšíří přístupy zaměstnanců či agentury. Rozšíření je samostatné rozhodnutí majitele nebo pověřeného správce.
- Souhrn „Všechny e-shopy“ zahrnuje pouze povolené e-shopy v aktuálním kontextu. Nesmí zobrazit nepovolené výsledky ani prostřednictvím součtů, exportů nebo chatu.
- Skrýt položku v menu nestačí: budoucí aplikace musí oprávnění kontrolovat také při čtení dat a provádění akcí. Toto současný vizuál neimplementuje.
- Přidělení a odebrání přístupu má mít dohledatelnou historii: kdo, komu, kdy a co změnil.
- Převod vlastnictví firmy je samostatná akce majitele, nikoliv běžné zaměstnanecké oprávnění. Její přesný postup se navrhne před implementací.

## 7. Příklady přístupů

| Člověk | Organizace a role | Rozsah | Povolené části |
| --- | --- | --- | --- |
| Eva | Firma Alfa · majitel firmy | Alfa CZ i Alfa SK | Všechny části vlastní firmy |
| Petr | Firma Alfa · zaměstnanec | Pouze Alfa CZ | Produkty: zobrazit a upravovat; Přehled: zobrazit |
| Klára | Agentura · majitel agentury | Firma Alfa a Firma Beta podle pověření | Marketingové části a vlastní agenturní tým; nikoliv automaticky finance klientů |
| Adam | Agentura · zaměstnanec | Pouze Firma Alfa / Alfa CZ | Meta a Google: zobrazit; Doporučení: zobrazit a připravovat návrhy |

Všechna jména a organizace v příkladu jsou ukázkové. Zaměstnanec agentury při otevření Firmy Beta neuvidí její obsah, pokud mu tato firma nebyla přidělena.

## 8. Jak má být model vidět ve webu

- Při výběru typu účtu používat označení **Majitel e-shopu / firmy** a **Marketingová agentura**.
- V kontextu firmy uvádět **Majitel firmy** jako nejvyšší roli.
- V agenturním prostředí ukazovat hierarchii **Agentura → klientská firma → e-shop**, s popisem pověřené správy.
- V přehledech vždy rozlišovat vybranou firmu, vybraný e-shop a roli uživatele v tomto kontextu.
- V Nastavení mít srozumitelnou část **Firmy, e-shopy a tým**, včetně přidělování přístupu po jednotlivých částech aplikace.
- U člena týmu uvádět, zda patří k firmě, nebo k agentuře, a zobrazit jeho skutečně přidělený rozsah.

**Nyní doplněno ve vizuálu:** přehled obou typů účtů, vztah agentury k firmám a e-shopům, popis správy zaměstnanců a rozbalovací přehled pravidel v Nastavení. Dokument je dostupný přímo z této stránky.

**Na pozdější návrh a implementaci zůstává:** registrace podle typu účtu, skutečný přepínač agentur a firem, pozvánky zaměstnanců, editor oprávnění, udělení a odvolání pověření agentuře, audit změn a skutečné vynucování přístupů. Počet agentur současně připojených k jedné firmě, převod vlastnictví a fakturační vztah klient–agentura zatím nejsou rozhodnuté.

## Související návrh: náklady společnosti

[Náklady společnosti](naklady-spolecnosti.md) popisují přiřazení nákladů firmě a e-shopům, sdílené náklady a jejich dopad na finanční výsledek. Přiřazení nákladu zaměstnance je nezávislé na jeho přístupech v aplikaci. Přístup k personálním nákladům vyžaduje samostatné finanční oprávnění.

## AI kredity u účtu

[Návrh AI kreditů](ai-kredity.md) popisuje firemní zůstatek, čerpání zaměstnanci a e-shopy i pověření agentury. Správa kreditů je oddělena od oprávnění používat AI.
