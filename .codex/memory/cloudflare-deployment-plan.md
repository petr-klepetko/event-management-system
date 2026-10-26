# Plán nasazení na Cloudflare

Aktualizováno: 22. 10. 2026

Stav: návrh; konfigurace ani nasazení na Cloudflare zatím nebyly provedeny.
Uživatel požádal o uložení plánu do projektové paměti. Tento dokument není pokyn k okamžitému nasazení, změně databáze ani pushi.

## Cíl a výchozí stav

Zpřístupnit Event Management System přes HTTPS na Cloudflare Workers. PostgreSQL bude nadále na Neonu. První krok je ověřené testovací nasazení; produkční prostředí následuje po kontrole funkčnosti a přístupů.

Ověřeno v repozitáři a historii práce k datu výše:

- GitHub: https://github.com/petr-klepetko/event-management-system
- Lokální kořen repozitáře: `C:\Users\klepe\workspace-personal\event-management-system\event-management-system`.
- Aktivní větev `users`, HEAD `f3ea453`. Dva commity (`6bc70e1`, `f3ea453`) nebyly při kontrole na vzdálené větvi `users`; vzdálený stav byl ověřen přes `git ls-remote`.
- Next.js 16.2.4, React 19, Prisma 7, `@prisma/adapter-pg` a `pg` 8.20.0 dle `package.json`.
- Aplikace používá Server Components, Server Actions, databázové relace uživatelů a middleware pro přesměrování na přihlášení.
- `src/lib/db/prisma.ts` vytváří Prisma klienta s PostgreSQL adaptérem a čte `DATABASE_URL`.
- Zatím není konfigurace Wrangleru, Cloudflare build ani potvrzená veřejná URL aplikace.
- Předchozí lint/build prošly podle historie práce. Aktuální běh ve Workers dosud nebyl ověřen.
- Migrace pro kalendářové události byla podle historie aplikována na Neon. Před nasazením ověřit skutečný stav zvoleného cíle.

## Technická cesta

Cloudflare nyní doporučuje pro Next.js 16 nasazení přes **vinext**. Jde o beta řešení, proto nejprve prověřit kompatibilitu a sestavení této aplikace. **OpenNext** je alternativa k posouzení při konkrétní nekompatibilitě; nezavádět obě cesty současně.

Workers podporují běh serverové části aplikace a PostgreSQL připojení přes kompatibilní driver. Současná kombinace Prisma + `pg` je výchozí kandidát. Její životní cyklus, pooling a chování při opakovaných požadavcích je nutné ověřit v runtime Workers. Případnou změnu adaptéru nebo doplnění Hyperdrive rozhodnout podle výsledku testu.

## Postup

### 1. Potvrdit cílové prostředí a prověřit kompatibilitu

- [ ] Znovu načíst `AGENTS.md`, projektový skill, Git status a relevantní diff; zachovat případnou novější práci.
- [ ] Zvolit Cloudflare účet, název Workeru a testovací prostředí. Přihlášení řešit přes podporovaný přihlašovací postup, žádné tokeny neukládat do tohoto dokumentu.
- [ ] Pro testovací prostředí určit samostatnou Neon databázi nebo větev. Preview sestavení nesmějí automaticky dostat produkční přístupové údaje.
- [ ] Ověřit aktuální dokumentaci, podporované verze a limity Cloudflare plánu, zejména velikost sestavení a CPU při přihlášení.
- [ ] Spustit kontrolu kompatibility vinext (`npx vinext check`) a vyhodnotit Server Actions, cookies, middleware, Prisma a Node.js crypto.
- [ ] Zaznamenat vybranou cestu a verze závislostí. U nových produkčních závislostí dodržet schvalování podle `AGENTS.md` a aktuálního zadání.

### 2. Připravit sestavení a lokální ověření Workers

- [ ] Doplnit konfiguraci zvolené integrační cesty: Wrangler, build/preview/deploy skripty a případné typy Cloudflare bindings.
- [ ] Nastavit kompatibilní datum Workers a Node.js kompatibilitu podle aktuální dokumentace.
- [ ] Zajistit generování Prisma klienta při čistém sestavení a správné zabalení pro cílový runtime.
- [ ] V `.gitignore` doplnit soubory s lokálními secrets a generované výstupy podle použitého nástroje, zejména `.dev.vars*` a `.wrangler/`.
- [ ] Upravit přístup k prostředí a databázi jen v nutném rozsahu. Ověřit, zda současný globální Prisma klient/pool může bezpečně obsluhovat více požadavků ve Workers.
- [ ] Spustit lint, dosavadní Next.js build a build pro Workers. Spustit aplikaci v lokálním Workers runtime a ověřit databázový dotaz i transakci.

### 3. Připravit přihlášení a provozní nastavení

- [ ] Ověřit hashování a kontrolu hesla přes `scryptSync` ve Workers včetně spotřeby CPU; případná úprava musí zachovat platnost existujících hesel.
- [ ] Vyřešit `src/lib/auth/rate-limit.ts`: současný `Map` žije jen v paměti jedné instance. Pro veřejný provoz zvolit a ověřit omezení pokusů použitelné napříč instancemi; prověřit i způsob získávání IP adresy za Cloudflare.
- [ ] Ověřit přihlášení, odhlášení, expiraci relace, secure cookies, pozvánky a oprávnění serverových akcí.
- [ ] Pro novou prázdnou databázi připravit vytvoření prvního správce před veřejným zpřístupněním. `/setup` je nyní dostupný při nulovém počtu uživatelů.
- [ ] Prověřit účty v cílové databázi. Lokální poznámky obsahují testovací účty; ty nesmějí neúmyslně zpřístupnit produkční data.

### 4. Nasadit testovací prostředí

- [ ] Nastavit `DATABASE_URL` jako Cloudflare secret. Odděleně určit proměnné potřebné při buildu a za běhu; citlivé hodnoty nedávat do repozitáře ani logů.
- [ ] Ověřit stav migrací proti testovací databázi. Pokud chybí, aplikovat schválené migrace řízeným krokem přes `prisma migrate deploy`; migrace nespouštět při obsluze požadavků.
- [ ] Nasadit na testovací adresu Workeru a zaznamenat URL, commit, použitý nástroj/verze a prostředí databáze bez přístupových údajů.
- [ ] Ověřit skutečné HTTPS chování: přihlášení a návraty mezi stránkami, uložení formulářů, přetrvání hodnot po chybě a aktualizaci dat po Server Action.
- [ ] Ověřit klienty, katalog služeb, akce, kalendářové události, přiřazení pracovníků, finance a tisk nabídky.
- [ ] Prověřit oddělení tenantů, roli správce a workerů včetně přímého otevření URL a volání serverových akcí. Worker nesmí získat cizí odměny ani finance akce.
- [ ] Prověřit veřejné/soukromé události, účastníky a datum/čas v kalendáři při serverovém časovém pásmu odlišném od Europe/Prague.
- [ ] Zkontrolovat logy, chyby a chování databáze při více po sobě jdoucích a souběžných požadavcích.

### 5. Připravit produkci a opakované nasazování

- [ ] Zvolit produkční větev, doménu a databázi. Současný `main` je starší než lokální `users`; automatické nasazení z `main` nesmí omylem publikovat starší verzi.
- [ ] Po autorizaci odeslat potřebné commity na GitHub a případné sloučení vyřešit běžným review postupem. Push není technickou podmínkou ručního nasazení, je však potřeba pro nasazování z GitHubu.
- [ ] Nastavit Workers Builds nebo GitHub Actions podle zvolené integrace: čistá instalace, generování Prisma, kontroly, build a deploy. Preview a produkce musí používat vlastní secrets.
- [ ] Zaznamenat dostupný postup obnovy databáze na Neonu a návratu na předchozí Worker verzi. Návrat kódu nevrací databázové migrace.
- [ ] Připravit ke schválení konkrétní produkční nasazení: cílový účet/Worker, URL, commit, databáze a případné náklady či migrace.
- [ ] Po schválení provést produkční nasazení, připojit doménu a zopakovat krátkou kontrolu přihlášení, čtení a zápisu dat.
- [ ] Doplnit README o provozní příkazy a tuto paměť o výslednou URL, postup nasazení a zbývající problémy.

## Předpokládané soubory pro implementaci

| Soubor | Účel |
| --- | --- |
| `package.json`, `package-lock.json` | Závislosti a skripty pro zvolený Cloudflare build. |
| `wrangler.jsonc` | Název Workeru, runtime, prostředí a bindings bez secrets. |
| `vite.config.*` nebo `open-next.config.ts` | Konfigurace jedné zvolené cesty. |
| `.gitignore` | Lokální secrets a generované výstupy. |
| `src/lib/db/prisma.ts` | Případné přizpůsobení prostředí a životního cyklu připojení. |
| `src/lib/auth/rate-limit.ts` a jeho volající | Omezení pokusů o přihlášení v distribuovaném prostředí. |
| `next.config.ts` / `tsconfig.json` | Pouze změny vyžadované vybranou integrací. |
| `README.md` | Ověřený postup vývoje, nasazení, prostředí a obnovy. |

Samotný hosting nevyžaduje změnu doménového databázového modelu. Upload příloh a jejich případné uložení do Cloudflare R2 jsou samostatný navazující úkol.

## Kritéria dokončení

- Aplikace funguje na zaznamenané HTTPS adrese a je znám přesný nasazený commit.
- Přihlášení, oprávnění tenantů/rolí, formuláře a databázové transakce prošly kontrolou ve Workers.
- Je určeno, která databáze patří testování a která produkci, a secrets nejsou v Gitu ani logách.
- Nasazení je opakovatelné a je zdokumentován návrat na předchozí verzi.

## Zdroje ověřené při přípravě plánu

Dokumentace se mění; při implementaci znovu ověřit doporučený postup a kompatibilitu verzí.

- [Cloudflare: Next.js, vinext a kontrola kompatibility](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Cloudflare: OpenNext adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [Cloudflare: PostgreSQL, pg a Hyperdrive](https://developers.cloudflare.com/workers/tutorials/postgres/)
- [Prisma 7: nasazení na Cloudflare Workers](https://docs.prisma.io/docs/orm/v7/prisma-client/deployment/edge/deploy-to-cloudflare)
- [Cloudflare: podpora Node.js crypto](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/)
