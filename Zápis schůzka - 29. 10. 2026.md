## Trim a odstranění whitespaců v cenách
Potřebujeme při zadávání jakékoliv ceny, aby se po uživatelském vstupu odstranily mezery a ostatní whitespacy, a v kolonce zůstalo pouze číslo (pokud klient zadává čísla s mezerami, tak aby mu to potom prošlo validací)

## Možnost přidat na službu v události náklad
- Aktuálně máme možnost přidat náklad v podobě nějakého pracovníka, či případného externího pracovníka, ale ve smyslu nějaké výplaty nebo platby za službu
- Potřebujeme mít možnost udělat i obecný náklad, např. na materiál, který se ale váže ke konkrétní službě, ne k celému plesu.
- Sekce "Pracovníci a dodavatelé na službě" se změní na "Pracovníci, dodavatelé a náklady na službě"
  - select "Interní pracovník" a "Externí dodavatel" se rozšíří o "Náklad ke službě"
  - v této nové volbě budou pole:
    - Náklad (název) - krátký text (aktuální "pracovník", resp. "dodavatel")
    - Popis nákladu - delší text (aktuální "popis práce")
    - Cena - (aktuální "Odměna")
    - (role na službě tam nebude)
- Podle toho upravíme DB tabulku náklad, aby tam nechybělo nic povinného, aby zkrátka mohl být náklad i v podobě nákladu bez pracovníka nebo dodavatele
- Tlačítko "Přidat pracovníka / dodavatele" se změní na "Přidat pracovníka / dodavatele / náklad"
- V tabulce Služby na akci se sloupec "Pracovníci / dodavatelé" přejmenuje cca na "Náklady" a budou tam pracovníci plus ty náklady
- Náklady na eventu zůstanou, jak jsou

## Bulkové přiávání služeb na event
- V detailu eventu vedle tlačítka "Přidat službu" budeme mít ještě "Hromadné přidání služby", což ať v dialogu nebo ve vlastní stránce ukáže formulář, kam se dynamicky zobrazí v tabulce nebo seznamu všechny aktivní služby, vždy jedna služba => jeden řádek
- U každé služby bude checkbox a pod tabulkou tlačítko "Přidat vybrané služby", které hromadně přidá všechny služby, které uživatel zaškrtl
- Vyplní se tam defaultní hodnoty, které jsou vyplněné v číselníku služeb, uživatel si poté doplní detaily, jak bude chtít