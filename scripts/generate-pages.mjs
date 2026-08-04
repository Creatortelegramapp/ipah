import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(root, String(process.env.IPAH_OUTPUT_DIR || '.'));
if (outputRoot !== root && !outputRoot.startsWith(`${root}/`)) {
  throw new Error('IPAH_OUTPUT_DIR must stay inside the project directory');
}
const basePath = `/${String(process.env.IPAH_BASE_PATH || '').replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
const sitePath = (path) => `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
const styles = (await readFile(resolve(root, 'assets/styles.css'), 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
const mainScriptVersion = createHash('sha256')
  .update(await readFile(resolve(root, 'assets/main.js'), 'utf8'))
  .digest('hex')
  .slice(0, 10);

const languages = {
  hy: { label: 'ՀԱՅ', name: 'Հայերեն', locale: 'hy_AM', path: sitePath('/hy/') },
  en: { label: 'ENG', name: 'English', locale: 'en_US', path: sitePath('/en/') },
  ru: { label: 'РУС', name: 'Русский', locale: 'ru_RU', path: sitePath('/ru/') },
};

const copy = {
  hy: {
    lang: 'hy',
    title: 'I PAH — գերեզմանների խնամք և ծաղիկների առաքում Հայաստանում',
    description: 'Գերեզմանների մաքրում, խնամք, բարեկարգում, վերականգնում, հայտնաբերում և ծաղիկների առաքում Հայաստանի ամբողջ տարածքում՝ լուսանկարներով ու տեսանյութերով հաշվետվությամբ։',
    skip: 'Անցնել հիմնական բովանդակությանը',
    menu: 'Բացել ընտրացանկը',
    close: 'Փակել ընտրացանկը',
    nav: ['Ծառայություններ', 'Ինչպես է աշխատում', 'Ծաղիկներ', 'Մեր խոստումը', 'Հարցեր'],
    navIds: ['services', 'process', 'flowers', 'promise', 'faq'],
    talk: 'Քննարկել պատվերը',
    heroEyebrow: 'Խնամք՝ Հայաստանի ամբողջ տարածքում',
    heroTitle: 'Հեռավորությունը չի խանգարի <em>հոգ տանելուն</em>',
    heroText: 'Դուք վստահում եք մեզ հարազատի գերեզմանի խնամքը, մենք տեղում կատարում ենք պայմանավորված աշխատանքը և յուրաքանչյուր փուլը հաստատում լուսանկարներով ու տեսանյութերով։',
    whatsapp: 'Գրել WhatsApp-ով',
    telegram: 'Գրել Telegram-ով',
    chatPickerKicker: 'Ընտրեք կապի եղանակը',
    chatPickerTitle: 'Որտե՞ղ շարունակենք զրույցը',
    chatPickerText: 'Ընտրեք ձեզ հարմար հավելվածը․ հարցման թեման հաղորդագրությանը կավելացվի ավտոմատ։',
    chatPickerClose: 'Փակել կապի եղանակի ընտրությունը',
    chatPickerPrivacy: 'Քննարկումը և ուղարկված նյութերը մնում են ձեր ու մեր թիմի փակ զրույցում։',
    response: 'Սովորաբար պատասխանում ենք նույն աշխատանքային օրվա ընթացքում',
    heroBadgeTop: 'Ամբողջ Հայաստան',
    heroBadgeMain: 'Մինչև · ընթացքում · հետո',
    heroBadgeSub: 'Փակ լուսանկար և տեսանյութ հաշվետվություն',
    heroAlt: 'AI-ով ստեղծված լուսավոր և խնամված պայմանական հուշապուրակ՝ Արարատի տեսարանով',
    trust: [
      ['Ամբողջ Հայաստան', 'Սպասարկում ենք բոլոր մարզերում'],
      ['Միշտ համաձայնեցված', 'Ծավալ, գին և ժամկետ՝ նախապես'],
      ['Տեսանելի արդյունք', 'Լուսանկար և տեսանյութ հաշվետվություն'],
      ['Մեկանգամյա կամ շարունակական', 'Ձեզ հարմար խնամքի պարբերականությամբ'],
    ],
    introKicker: 'I PAH — «ի պահ հանձնել»',
    introTitle: 'Ձեր հոգատարությունը՝ մեր պարտքն է',
    introText: 'I PAH-ը ստեղծված է հատկապես արտերկրում ապրող հայերի համար։ Երբ հեռավորությունը թույլ չի տալիս անձամբ լինել հարազատի շիրիմի կողքին, վստահելի տեղական թիմը կարող է պահպանել տարածքի մաքրությունն ու արժանապատիվ տեսքը։',
    introAside: 'Ոչ մի հրապարակային իրական գերեզման։ Ձեր նյութերը մնում են միայն ձեր և մեր թիմի միջև։',
    servicesKicker: 'Ինչով կարող ենք օգնել',
    servicesTitle: 'Ամբողջական խնամք՝ մեկ վստահելի թիմից',
    servicesText: 'Ընտրեք անհրաժեշտ ուղղությունը։ Աշխատանքի ծավալն ու պայմանները հստակեցնում ենք միայն տեղանքի մասին տեղեկություն ստանալուց կամ նախնական զննումից հետո։',
    serviceImagePrefix: 'AI-ով ստեղծված պայմանական տեսարան',
    services: [
      ['Մաքրում և խնամք', 'Փոշու, հողի ու տերևների մաքրում, մակերեսների լվացում, տարածքի կոկիկացում և սեզոնային խնամք։', 'Մաքրում'],
      ['Բարեկարգում', 'Հողի, կանաչապատման, եզրաքարերի և շրջակա փոքր տարածքի խնամք՝ ըստ տեղանքի կարիքների։', 'Բարեկարգում'],
      ['Վերականգնում', 'Վնասված հատվածների, սալիկների, ցանկապատի կամ հուշաքարի խնդիրների գնահատում և համաձայնեցված վերականգնում։', 'Վերականգնում'],
      ['Գերեզմանի հայտնաբերում', 'Եթե ճշգրիտ տեղը հայտնի չէ, մեր աշխատակիցը կարող է որոնել այն՝ նախապես քննարկված տվյալներով ու պայմաններով։', 'Հայտնաբերում'],
      ['Պարբերական խնամք', 'Շարունակական սպասարկում՝ ձեր ընտրած հաճախականությամբ, յուրաքանչյուր այցելության առանձին հաշվետվությամբ։', 'Պարբերական խնամք'],
      ['Ծաղիկների առաքում', 'Ծաղկեպսակ, վարդեր, մեխակներ, զամբյուղ կամ ծաղկեփունջ՝ մեկ անգամ կամ պարբերաբար։', 'Ծաղիկների առաքում'],
    ],
    discussService: 'Քննարկել',
    processKicker: 'Պարզ և վերահսկելի ընթացք',
    processTitle: 'Դուք գիտեք՝ ինչ է կատարվում յուրաքանչյուր փուլում',
    processText: 'Մենք աշխատանք չենք սկսում, մինչև միասին չհաստատենք անելիքը, արժեքը, ժամկետը և բոլոր պայմանները։',
    steps: [
      ['Գրում եք մեզ', 'WhatsApp-ով կամ Telegram-ով նշում եք անունը, գերեզմանատունը և ձեր ցանկությունը։'],
      ['Գտնում ենք տեղանքը', 'Տալիս եք ճշգրիտ տեղը, ձեր հարազատը ուղեկցում է աշխատակցին, կամ որոնումը կազմակերպում ենք մենք։'],
      ['Ֆիքսում ենք ներկա վիճակը', 'Աշխատակիցը նկարահանում է ամբողջ գերեզմանն ու շրջակա տարածքը՝ լուսանկարով և տեսանյութով։'],
      ['Միասին համաձայնեցնում ենք', 'Քննարկում ենք անելիքը, արժեքը, ժամկետը, նյութերն ու սպասվող արդյունքը։'],
      ['Կատարում և հաշվետվություն', 'Աշխատանքից հետո ստանում եք մանրամասն լուսանկարներ ու տեսանյութեր, իսկ երկարատև աշխատանքի դեպքում՝ նաև ընթացքից։'],
    ],
    locationNoteTitle: 'Չգիտե՞ք ճշգրիտ տեղը',
    locationNoteText: 'Ուղարկեք մեզ հնարավոր բոլոր տվյալները՝ գերեզմանատան անունը, բնակավայրը, հարազատի անունը, մոտավոր տարեթվերը կամ կողմնորոշիչները։ Որոնման հնարավորությունն ու պայմանները կքննարկենք chat-ում։',
    locationCta: 'Հարցնել հայտնաբերման մասին',
    reportKicker: 'Տեսանելի հաշվետվություն',
    reportTitle: 'Աշխատանքի ամբողջ ընթացքը՝ մեկ հայացքով',
    reportText: 'Յուրաքանչյուր պատվերի դեպքում ստանում եք նույն տեղանքի «մինչև», «ընթացքում» և «հետո» լուսանկարներն ու տեսանյութերը։ Ստորև ներկայացված երեք կադրերը AI-ով ստեղծված պայմանական օրինակ են, իսկ իրական հաշվետվությունը մնում է միայն ձեր և մեր թիմի միջև։',
    reportCards: [
      ['Մինչև', 'Տարածքի ընդհանուր և մանրամասն վիճակը՝ աշխատանքից առաջ'],
      ['Ընթացքում', 'Կատարվող խնամքը և կարևոր փուլերը՝ ըստ անհրաժեշտության'],
      ['Հետո', 'Մաքրված և բարեկարգված վերջնական արդյունքը'],
    ],
    privateLabel: 'Մասնավոր և պաշտպանված',
    reportAlts: [
      'AI-ով ստեղծված մեկ պայմանական ժամանակակից հայկական գերեզման՝ խոտածածկ և փոշոտ վիճակում խնամքից առաջ',
      'Նույն պայմանական հայկական գերեզմանը խնամքի ընթացքում՝ գործիքներով և կիսամաքրված մակերեսով',
      'Նույն պայմանական հայկական գերեզմանի մաքրված վիճակը՝ թարմ ծաղկային կոմպոզիցիայով',
    ],
    plansKicker: 'Ձեզ հարմար ձևաչափով',
    plansTitle: 'Մեկ անգամ, թե շարունակաբար՝ ընտրությունը ձերն է',
    onceTitle: 'Մեկանգամյա պատվեր',
    onceText: 'Մաքրում, վերականգնում, բարեկարգում կամ ծաղիկների առաքում կոնկրետ օրվա կամ անհրաժեշտության համար։',
    onceList: ['Անհատական գնահատում', 'Հստակ վերջնաժամկետ', 'Վերջնական հաշվետվություն'],
    regularTitle: 'Շարունակական խնամք',
    regularText: 'Կանոնավոր այցելություններ՝ ամսական, սեզոնային կամ ձեր նախընտրած այլ հաճախականությամբ։',
    regularList: ['Համաձայնեցված պարբերականություն', 'Յուրաքանչյուր այցի հաշվետվություն', 'Ծաղիկների պարբերական առաքման հնարավորություն'],
    noPrice: 'Գինը հրապարակային չէ․ այն կախված է տեղանքից, ծավալից, նյութերից և հաճախականությունից։',
    plansCta: 'Քննարկել պայմանները',
    flowersKicker: 'Ծաղիկներ՝ ճիշտ օրը',
    flowersTitle: 'Ձեր անունից՝ խնամքով հասցված',
    flowersText: 'Ընտրեք ընդհանուր տեսակը, իսկ գույնը, չափը, քանակը, առաքման օրը և արժեքը միասին կհստակեցնենք chat-ում։ Առաքումը կարող է լինել մեկանգամյա կամ պարբերական։',
    flowersAlt: 'AI-ով ստեղծված ծաղկեպսակ, վարդեր, մեխակներ և ծաղկային զամբյուղ բաց արվեստանոցում',
    flowerImagePrefix: 'AI-ով ստեղծված պայմանական ծաղկային տարբերակ',
    flowerExample: 'AI օրինակ',
    flowerDiscuss: 'Քննարկել այս տեսակը',
    flowerCarouselLabel: 'Ծաղիկների կատեգորիաներ',
    flowerPrevious: 'Նախորդ կատեգորիան',
    flowerNext: 'Հաջորդ կատեգորիան',
    flowerSlideLabel: 'Բացել կատեգորիան',
    flowerCatalog: [
      { title: 'Ծաղկեպսակներ', description: 'Տարբեր չափերի և գունային լուծումների ծաղկեպսակներ՝ զուսպից մինչև առավել ընդգծված տարբերակ։', variants: [
        ['Փոքր · մոտ 45 սմ', 'Սպիտակ մեխակներ', 'wreath-small-ivory'],
        ['Միջին · մոտ 65 սմ', 'Փղոսկրագույն և նուրբ վարդագույն', 'wreath-medium-blush'],
        ['Մեծ · մոտ 90 սմ', 'Սպիտակ և բորդո', 'wreath-large-burgundy'],
      ] },
      { title: 'Վարդեր', description: 'Վարդերի քանակն ու գույնը ընտրում ենք ձեր նախընտրության և առաքման առիթի համաձայն։', variants: [
        ['15 վարդ', 'Սպիտակ', 'roses-small-ivory'],
        ['35 վարդ', 'Նուրբ վարդագույն', 'roses-medium-blush'],
        ['55 վարդ', 'Խորը կարմիր', 'roses-large-red'],
      ] },
      { title: 'Մեխակներ', description: 'Քանակով և գունային համադրությամբ տարբեր դասավորություններ՝ մեկանգամյա կամ պարբերական առաքման համար։', variants: [
        ['20 մեխակ', 'Սպիտակ', 'carnations-small-white'],
        ['40 մեխակ', 'Նուրբ վարդագույն', 'carnations-medium-pink'],
        ['70 մեխակ', 'Սպիտակ և բորդո', 'carnations-large-mixed'],
      ] },
      { title: 'Զամբյուղներ', description: 'Չափից և հագեցվածությունից կախված՝ պարզ, ավելի հարուստ կամ շքեղ ծաղկային զամբյուղներ։', variants: [
        ['Փոքր', 'Զուսպ և պարզ', 'basket-small-simple'],
        ['Միջին', 'Հարուստ և նրբագեղ', 'basket-medium-elegant'],
        ['Մեծ', 'Շքեղ և ծավալուն', 'basket-large-luxury'],
      ] },
      { title: 'Ծաղկեփնջեր', description: 'Տարբեր ծավալների խառը ծաղկեփնջեր՝ հանգիստ, արժանապատիվ գունային համադրությամբ։', variants: [
        ['Փոքր', 'Զուսպ սպիտակ', 'bouquet-small-restrained'],
        ['Միջին', 'Սպիտակ և նուրբ վարդագույն', 'bouquet-medium-mixed'],
        ['Մեծ', 'Հագեցած խառը կազմ', 'bouquet-large-full'],
      ] },
    ],
    flowerNote: 'Կայքում ներկայացված են տեսակները, ոչ թե ֆիքսված ապրանքներ կամ գներ։ Յուրաքանչյուր պատվեր կազմվում է անհատապես։',
    flowerCta: 'Քննարկել ծաղիկների պատվերը',
    coverageKicker: 'Որտեղ էլ լինի Հայաստանում',
    coverageTitle: 'Մեկ կապի կետ՝ ամբողջ երկրի համար',
    coverageText: 'Երևանից մինչև հեռավոր համայնքներ՝ նախապես ճշտում ենք ճանապարհը, հասանելիությունը և այցելության հնարավոր ժամկետը։',
    regions: ['Երևան', 'Արագածոտն', 'Արարատ', 'Արմավիր', 'Գեղարքունիք', 'Կոտայք', 'Լոռի', 'Շիրակ', 'Սյունիք', 'Տավուշ', 'Վայոց ձոր'],
    promiseKicker: 'Մեր աշխատանքային սկզբունքները',
    promiseTitle: 'Հանգիստ վստահություն՝ առանց անորոշության',
    promises: [
      ['Մարդկային վերաբերմունք', 'Յուրաքանչյուր պատմության մոտենում ենք նրբանկատ և հարգալից։'],
      ['Ոչ մի անակնկալ աշխատանք', 'Կատարում ենք միայն ձեր հաստատած ծավալը և պայմանները։'],
      ['Ազնիվ ներկայացում', 'Եթե որևէ աշխատանք տվյալ պահին հնարավոր չէ, ասում ենք նախապես։'],
      ['Տվյալների գաղտնիություն', 'Անունները, տեղանքը և հաշվետվությունները մնում են փակ հաղորդակցության մեջ։'],
    ],
    faqKicker: 'Հաճախ տրվող հարցեր',
    faqTitle: 'Կարճ պատասխաններ՝ կարևոր հարցերին',
    faqs: [
      ['Ինչպե՞ս եք գտնում գերեզմանը։', 'Կարող եք ուղարկել ճշգրիտ տեղադրությունը, պայմանավորվել, որ ձեր հարազատը կամ ծանոթը տեղում ուղեկցի աշխատակցին, կամ մեզ փոխանցել որոնման համար եղած տվյալները։ Վերջին տարբերակի պայմաններն ու արժեքը նախապես քննարկվում են chat-ում։'],
      ['Ինչո՞ւ կայքում գներ չկան։', 'Յուրաքանչյուր տեղանք և աշխատանք տարբեր է։ Գինը ձևավորվում է գերեզմանի վիճակից, գտնվելու վայրից, աշխատանքի ծավալից, անհրաժեշտ նյութերից և հաճախականությունից՝ նախնական զննումից հետո։'],
      ['Արդյո՞ք սպասարկում եք Հայաստանի մարզերում։', 'Այո։ Աշխատում ենք Հայաստանի ամբողջ տարածքում։ Հեռավոր համայնքների դեպքում նախապես համաձայնեցնում ենք ճանապարհային պայմաններն ու ժամկետը։'],
      ['Կարո՞ղ եմ պատվիրել կանոնավոր խնամք։', 'Այո։ Հաճախականությունը կարող է լինել ամսական, սեզոնային, հիշատակի օրերին կամ ձեր ընտրած այլ գրաֆիկով։ Պայմանները ձևավորվում են անհատապես։'],
      ['Որտե՞ղ են ուղարկվում լուսանկարներն ու տեսանյութերը։', 'Հաշվետվությունը ստանում եք նույն փակ WhatsApp կամ Telegram զրույցում։ Առանց ձեր թույլտվության այն չի դառնում հրապարակային նյութ։'],
      ['Ինչպե՞ս է պատվիրվում ծաղիկների առաքումը։', 'Նշում եք տեսակը, նախընտրած գույները, քանակը և օրը։ Մենք առաջարկում ենք հասանելի տարբերակները, համաձայնեցնում արժեքը և առաքում մեկ անգամ կամ ձեր ընտրած պարբերականությամբ։'],
    ],
    ctaKicker: 'Սկսենք մեկ հաղորդագրությունից',
    ctaTitle: 'Պատմեք՝ որտեղ է գտնվում գերեզմանը և ինչ խնամք է անհրաժեշտ',
    ctaText: 'Եթե տվյալները ամբողջական չեն, միևնույն է գրեք։ Կօգնենք հասկանալ հաջորդ քայլը և կասենք՝ ինչ տեղեկություն է պետք։',
    ctaWhats: 'Սկսել WhatsApp-ում',
    ctaTele: 'Սկսել Telegram-ում',
    noCommit: 'Առաջին քննարկումը որևէ պարտավորություն չի ստեղծում',
    footerText: 'Հեռավորությունը փոխում է ձևը, ոչ թե հոգատարությունը։',
    footerNav: 'Նավիգացիա',
    footerContact: 'Կապ',
    footerPrivacy: 'Գաղտնիության սկզբունք',
    privacyText: 'Կայքը չի պահանջում գրանցում և չի հրապարակում հաճախորդների տվյալները կամ հաշվետվությունները։ Պատվերի ընթացքում ստացված նյութերը օգտագործվում են միայն ծառայության կատարման և անձնական հաշվետվության համար։',
    rights: 'Բոլոր իրավունքները պաշտպանված են։',
    aiNote: 'Կայքի բոլոր տեսարանները ստեղծված են AI-ով և չեն պատկերում իրական մարդկանց գերեզմաններ։',
    backTop: 'Վերադառնալ վերև',
    chatMessage: 'Բարև ձեզ։ Ցանկանում եմ տեղեկանալ I PAH ծառայության մասին։',
  },
  en: {
    lang: 'en',
    title: 'I PAH — grave care and flower delivery across Armenia',
    description: 'Grave cleaning, care, landscaping, restoration, location assistance and flower delivery anywhere in Armenia, with private photo and video reports.',
    skip: 'Skip to main content', menu: 'Open menu', close: 'Close menu',
    nav: ['Services', 'How it works', 'Flowers', 'Our promise', 'FAQ'], navIds: ['services', 'process', 'flowers', 'promise', 'faq'], talk: 'Discuss your request',
    heroEyebrow: 'Care across all of Armenia',
    heroTitle: 'Distance should not stand in the way of <em>care</em>',
    heroText: 'Entrust us with your loved one’s resting place. We carry out the agreed work locally and document every stage with private photos and videos.',
    whatsapp: 'Message on WhatsApp', telegram: 'Message on Telegram',
    chatPickerKicker: 'Choose how to contact us', chatPickerTitle: 'Where would you like to continue?',
    chatPickerText: 'Choose the app that suits you. The subject of your request will be added to the message automatically.',
    chatPickerClose: 'Close contact method selection', chatPickerPrivacy: 'The conversation and any materials you send remain private between you and our team.',
    response: 'We usually reply within the same business day',
    heroBadgeTop: 'All of Armenia', heroBadgeMain: 'Before · during · after', heroBadgeSub: 'Private photo and video reporting',
    heroAlt: 'AI-created serene memorial garden with a distant view of Mount Ararat',
    trust: [['Nationwide coverage', 'Service in every region of Armenia'], ['Agreed in advance', 'Scope, cost and timing confirmed first'], ['Visible results', 'Private photo and video reports'], ['One-time or ongoing', 'A care schedule that fits your needs']],
    introKicker: 'I PAH — entrusted to our care', introTitle: 'Your care is our responsibility',
    introText: 'I PAH was created especially for Armenians living abroad. When distance makes it impossible to visit in person, a reliable local team can preserve the cleanliness and dignity of your loved one’s resting place.',
    introAside: 'No real graves are displayed publicly. Your materials remain strictly between you and our team.',
    servicesKicker: 'How we can help', servicesTitle: 'Complete care from one trusted team', servicesText: 'Choose the support you need. We confirm scope and conditions only after receiving location details or completing an initial inspection.', serviceImagePrefix: 'AI-created fictional service scene',
    services: [
      ['Cleaning & care', 'Removal of dust, soil and leaves, careful washing of surfaces, tidying and seasonal maintenance.', 'Cleaning'],
      ['Landscaping', 'Care for soil, plants, edging and the surrounding area, based on the needs of the site.', 'Landscaping'],
      ['Restoration', 'Assessment and agreed repair of damaged sections, paving, fencing or memorial stone.', 'Restoration'],
      ['Grave location', 'If the exact location is unknown, our specialist may search using the details agreed with you in advance.', 'Location assistance'],
      ['Ongoing care', 'Scheduled visits at your preferred frequency, with a separate report after every visit.', 'Ongoing care'],
      ['Flower delivery', 'Wreaths, roses, carnations, baskets or bouquets delivered once or regularly.', 'Flower delivery'],
    ],
    discussService: 'Discuss', processKicker: 'A clear, controlled process', processTitle: 'You know what is happening at every stage',
    processText: 'We do not begin until the work, cost, timeline and all conditions have been confirmed with you.',
    steps: [['Message us', 'Tell us the name, cemetery and your request on WhatsApp or Telegram.'], ['Locate the site', 'Share the exact location, have a relative guide our specialist, or arrange for us to search.'], ['Document the current state', 'Our specialist records the entire grave and surrounding area in photos and video.'], ['Confirm everything together', 'We agree on the work, cost, timing, materials and expected result.'], ['Complete and report', 'You receive detailed photos and video after completion—and during longer work as agreed.']],
    locationNoteTitle: 'Do not know the exact location?', locationNoteText: 'Send every detail you have: cemetery, town, your relative’s name, approximate dates or landmarks. We will discuss the feasibility, terms and cost of the search in chat.', locationCta: 'Ask about location assistance',
    reportKicker: 'Visible reporting', reportTitle: 'The complete work process at a glance',
    reportText: 'For every order, you receive before, during and after photos and videos of the same site. The three frames below are an AI-created fictional example; your real report remains private between you and our team.',
    reportCards: [['Before', 'The site’s overall and detailed condition before work begins'], ['During', 'Care in progress and the important stages when needed'], ['After', 'The final cleaned and carefully maintained result']], privateLabel: 'Private and protected',
    reportAlts: ['One AI-created fictional contemporary Armenian grave, overgrown and dusty before professional care', 'The same fictional Armenian grave during care, with tools and partially cleaned surfaces', 'The same fictional Armenian grave clean and finished with a fresh floral arrangement'],
    plansKicker: 'A format that works for you', plansTitle: 'One visit or ongoing care—the choice is yours',
    onceTitle: 'One-time service', onceText: 'Cleaning, restoration, landscaping or flower delivery for a specific date or need.', onceList: ['Individual assessment', 'Clear completion date', 'Final report'],
    regularTitle: 'Ongoing care', regularText: 'Regular visits monthly, seasonally or at another frequency that suits you.', regularList: ['Agreed schedule', 'Report after every visit', 'Optional recurring flower delivery'],
    noPrice: 'Prices are not fixed online: they depend on location, scope, materials and frequency.', plansCta: 'Discuss the terms',
    flowersKicker: 'Flowers on the right day', flowersTitle: 'Delivered with care, in your name', flowersText: 'Choose the general style, then we confirm colors, size, quantity, delivery date and cost together in chat. Delivery can be one-time or recurring.',
    flowersAlt: 'AI-created arrangement of a wreath, roses, carnations and a flower basket in a bright studio',
    flowerImagePrefix: 'AI-created illustrative flower option', flowerExample: 'AI example', flowerDiscuss: 'Discuss this category',
    flowerCarouselLabel: 'Flower categories', flowerPrevious: 'Previous category', flowerNext: 'Next category', flowerSlideLabel: 'Open category',
    flowerCatalog: [
      { title: 'Wreaths', description: 'Wreaths in different sizes and color palettes, from restrained to more substantial arrangements.', variants: [
        ['Small · approx. 45 cm', 'White carnations', 'wreath-small-ivory'],
        ['Medium · approx. 65 cm', 'Ivory and soft blush', 'wreath-medium-blush'],
        ['Large · approx. 90 cm', 'Ivory and burgundy', 'wreath-large-burgundy'],
      ] },
      { title: 'Roses', description: 'Rose quantity and color are selected to suit your preference and the delivery occasion.', variants: [
        ['15 roses', 'Ivory white', 'roses-small-ivory'],
        ['35 roses', 'Soft blush pink', 'roses-medium-blush'],
        ['55 roses', 'Deep red', 'roses-large-red'],
      ] },
      { title: 'Carnations', description: 'Arrangements with different quantities and color combinations for one-time or recurring delivery.', variants: [
        ['20 carnations', 'White', 'carnations-small-white'],
        ['40 carnations', 'Soft pink', 'carnations-medium-pink'],
        ['70 carnations', 'Ivory and burgundy', 'carnations-large-mixed'],
      ] },
      { title: 'Baskets', description: 'Simple, fuller or luxurious flower baskets, distinguished by size and richness.', variants: [
        ['Small', 'Simple and restrained', 'basket-small-simple'],
        ['Medium', 'Full and elegant', 'basket-medium-elegant'],
        ['Large', 'Luxurious and abundant', 'basket-large-luxury'],
      ] },
      { title: 'Bouquets', description: 'Mixed bouquets in different volumes, using calm and dignified color combinations.', variants: [
        ['Small', 'Restrained ivory', 'bouquet-small-restrained'],
        ['Medium', 'Ivory and soft blush', 'bouquet-medium-mixed'],
        ['Large', 'Full mixed composition', 'bouquet-large-full'],
      ] },
    ],
    flowerNote: 'The website presents categories, not fixed products or prices. Every order is prepared individually.', flowerCta: 'Discuss a flower order',
    coverageKicker: 'Wherever it is in Armenia', coverageTitle: 'One point of contact for the whole country', coverageText: 'From Yerevan to remote communities, we confirm access, travel conditions and the earliest possible visit in advance.',
    regions: ['Yerevan', 'Aragatsotn', 'Ararat', 'Armavir', 'Gegharkunik', 'Kotayk', 'Lori', 'Shirak', 'Syunik', 'Tavush', 'Vayots Dzor'],
    promiseKicker: 'How we work', promiseTitle: 'Quiet confidence, without uncertainty', promises: [['Human consideration', 'Every family story is met with tact and respect.'], ['No unapproved work', 'We perform only the scope and conditions you have confirmed.'], ['Honest expectations', 'If something is not feasible, we explain it before any commitment.'], ['Privacy by default', 'Names, locations and reports remain in private communication.']],
    faqKicker: 'Frequently asked questions', faqTitle: 'Clear answers to important questions', faqs: [
      ['How do you locate a grave?', 'You can send an exact location, arrange for a relative or friend to guide our specialist, or share the information available for us to search. Search terms and cost are always discussed in chat first.'],
      ['Why are there no prices on the website?', 'Every site is different. Cost depends on condition, location, scope, materials and service frequency, and is confirmed after an initial assessment.'],
      ['Do you work outside Yerevan?', 'Yes. We serve all of Armenia. For remote communities, travel conditions and timing are agreed in advance.'],
      ['Can I arrange regular care?', 'Yes. Visits may be monthly, seasonal, on remembrance dates or according to another schedule you choose. Terms are always individual.'],
      ['Where do I receive photos and videos?', 'Your report is sent in the same private WhatsApp or Telegram conversation and is never made public without your permission.'],
      ['How does flower delivery work?', 'Tell us the category, preferred colors, quantity and date. We propose available options, confirm the cost and deliver once or on an agreed recurring schedule.'],
    ],
    ctaKicker: 'It starts with one message', ctaTitle: 'Tell us where the grave is and what kind of care is needed', ctaText: 'If you do not have every detail, message us anyway. We will help identify the next step and explain what information is needed.',
    ctaWhats: 'Start on WhatsApp', ctaTele: 'Start on Telegram', noCommit: 'The first conversation creates no obligation',
    footerText: 'Distance changes the way we care, not how much we care.', footerNav: 'Navigation', footerContact: 'Contact', footerPrivacy: 'Privacy principle',
    privacyText: 'The website requires no account and never publishes client data or reports. Materials received during an order are used only to perform the service and provide your private report.', rights: 'All rights reserved.',
    aiNote: 'Every scene on this website is AI-created and does not depict a real person’s grave.', backTop: 'Back to top', chatMessage: 'Hello. I would like to learn more about I PAH services.',
  },
  ru: {
    lang: 'ru',
    title: 'I PAH — уход за могилами и доставка цветов по всей Армении',
    description: 'Уборка, благоустройство, восстановление и поиск захоронений, а также доставка цветов по всей Армении с приватными фото- и видеоотчётами.',
    skip: 'Перейти к основному содержанию', menu: 'Открыть меню', close: 'Закрыть меню',
    nav: ['Услуги', 'Как мы работаем', 'Цветы', 'Наши принципы', 'Вопросы'], navIds: ['services', 'process', 'flowers', 'promise', 'faq'], talk: 'Обсудить заказ',
    heroEyebrow: 'Забота по всей Армении', heroTitle: 'Расстояние не должно мешать <em>заботе</em>',
    heroText: 'Доверьте нам уход за местом упокоения близкого человека. Мы выполним согласованные работы на месте и покажем каждый этап в приватном фото- и видеоотчёте.',
    whatsapp: 'Написать в WhatsApp', telegram: 'Написать в Telegram',
    chatPickerKicker: 'Выберите способ связи', chatPickerTitle: 'Где продолжим общение?',
    chatPickerText: 'Выберите удобное приложение. Тема вашего обращения добавится в сообщение автоматически.',
    chatPickerClose: 'Закрыть выбор способа связи', chatPickerPrivacy: 'Переписка и отправленные материалы остаются только между вами и нашей командой.',
    response: 'Обычно отвечаем в течение того же рабочего дня',
    heroBadgeTop: 'Вся Армения', heroBadgeMain: 'До · в процессе · после', heroBadgeSub: 'Приватный фото- и видеоотчёт', heroAlt: 'Созданный ИИ светлый мемориальный сад с видом на Арарат',
    trust: [['По всей стране', 'Работаем во всех регионах Армении'], ['Всё согласовано', 'Объём, стоимость и сроки — заранее'], ['Наглядный результат', 'Приватные фото- и видеоотчёты'], ['Разово или регулярно', 'Удобная для вас периодичность ухода']],
    introKicker: 'I PAH — доверить на хранение', introTitle: 'Ваша забота — наша ответственность',
    introText: 'I PAH создан прежде всего для армян, живущих за рубежом. Когда расстояние не позволяет приехать лично, надёжная местная команда поможет сохранить чистоту и достойный вид места упокоения близкого человека.',
    introAside: 'Никаких реальных могил в открытом доступе. Ваши материалы остаются строго между вами и нашей командой.',
    servicesKicker: 'Чем мы можем помочь', servicesTitle: 'Полный уход силами одной надёжной команды', servicesText: 'Выберите нужное направление. Объём и условия работ определяются после получения данных о месте или предварительного осмотра.', serviceImagePrefix: 'Созданная ИИ условная сцена услуги',
    services: [
      ['Уборка и уход', 'Очистка от пыли, земли и листвы, бережное мытьё поверхностей, наведение порядка и сезонный уход.', 'Уборка'],
      ['Благоустройство', 'Уход за почвой, растениями, бордюрами и прилегающей территорией с учётом состояния места.', 'Благоустройство'],
      ['Восстановление', 'Оценка и согласованный ремонт повреждённых участков, плитки, ограды или памятника.', 'Восстановление'],
      ['Поиск захоронения', 'Если точное место неизвестно, наш сотрудник может провести поиск по заранее согласованным данным и условиям.', 'Поиск захоронения'],
      ['Регулярный уход', 'Плановые посещения с удобной вам периодичностью и отдельным отчётом после каждого визита.', 'Регулярный уход'],
      ['Доставка цветов', 'Венки, розы, гвоздики, корзины или букеты — разово либо регулярно.', 'Доставка цветов'],
    ],
    discussService: 'Обсудить', processKicker: 'Понятный и контролируемый процесс', processTitle: 'Вы знаете, что происходит на каждом этапе', processText: 'Мы не начинаем работу, пока вместе с вами не подтвердим объём, стоимость, сроки и все условия.',
    steps: [['Вы пишете нам', 'Сообщаете имя, кладбище и пожелания в WhatsApp или Telegram.'], ['Находим место', 'Вы присылаете точную локацию, ваш близкий сопровождает сотрудника или поиск организуем мы.'], ['Фиксируем состояние', 'Сотрудник снимает всё захоронение и прилегающую территорию на фото и видео.'], ['Всё согласовываем', 'Обсуждаем работы, стоимость, сроки, материалы и ожидаемый результат.'], ['Выполняем и отчитываемся', 'После завершения вы получаете подробные фото и видео, а при длительных работах — также материалы процесса.']],
    locationNoteTitle: 'Не знаете точное место?', locationNoteText: 'Пришлите всё, что известно: название кладбища, населённый пункт, имя близкого, примерные даты или ориентиры. Возможность, условия и стоимость поиска обсудим в чате.', locationCta: 'Узнать о поиске захоронения',
    reportKicker: 'Наглядный отчёт', reportTitle: 'Весь процесс работы — в трёх понятных кадрах', reportText: 'Для каждого заказа вы получаете фото и видео одного и того же места до, в процессе и после работы. Три кадра ниже — созданный ИИ условный пример; реальный отчёт остаётся только между вами и нашей командой.',
    reportCards: [['До', 'Общий вид и детали участка до начала работы'], ['В процессе', 'Выполняемый уход и важные этапы при необходимости'], ['После', 'Очищенный и благоустроенный итоговый результат']], privateLabel: 'Приватно и защищённо',
    reportAlts: ['Созданная ИИ условная современная армянская могила, заросшая и пыльная до ухода', 'Та же условная армянская могила в процессе ухода — с инструментами и частично очищенной поверхностью', 'Та же условная армянская могила после уборки со свежей цветочной композицией'],
    plansKicker: 'В удобном для вас формате', plansTitle: 'Один визит или постоянный уход — решать вам',
    onceTitle: 'Разовый заказ', onceText: 'Уборка, восстановление, благоустройство или доставка цветов к конкретной дате или по необходимости.', onceList: ['Индивидуальная оценка', 'Чёткий срок', 'Итоговый отчёт'],
    regularTitle: 'Постоянный уход', regularText: 'Регулярные посещения раз в месяц, по сезонам или с другой удобной вам периодичностью.', regularList: ['Согласованный график', 'Отчёт после каждого визита', 'Возможность регулярной доставки цветов'],
    noPrice: 'На сайте нет фиксированных цен: стоимость зависит от места, объёма, материалов и периодичности.', plansCta: 'Обсудить условия',
    flowersKicker: 'Цветы в важный день', flowersTitle: 'Бережно доставим от вашего имени', flowersText: 'Выберите общий формат, а цвет, размер, количество, дату доставки и стоимость мы согласуем вместе в чате. Доставка может быть разовой или регулярной.',
    flowersAlt: 'Созданная ИИ композиция из венка, роз, гвоздик и цветочной корзины в светлой мастерской',
    flowerImagePrefix: 'Созданный ИИ условный вариант цветов', flowerExample: 'Пример ИИ', flowerDiscuss: 'Обсудить эту категорию',
    flowerCarouselLabel: 'Категории цветов', flowerPrevious: 'Предыдущая категория', flowerNext: 'Следующая категория', flowerSlideLabel: 'Открыть категорию',
    flowerCatalog: [
      { title: 'Венки', description: 'Венки разных размеров и цветовых решений — от сдержанных до более объёмных.', variants: [
        ['Малый · около 45 см', 'Белые гвоздики', 'wreath-small-ivory'],
        ['Средний · около 65 см', 'Айвори и нежно-розовый', 'wreath-medium-blush'],
        ['Большой · около 90 см', 'Айвори и бордовый', 'wreath-large-burgundy'],
      ] },
      { title: 'Розы', description: 'Количество и цвет роз подбираются с учётом ваших пожеланий и повода доставки.', variants: [
        ['15 роз', 'Белые', 'roses-small-ivory'],
        ['35 роз', 'Нежно-розовые', 'roses-medium-blush'],
        ['55 роз', 'Тёмно-красные', 'roses-large-red'],
      ] },
      { title: 'Гвоздики', description: 'Композиции разного объёма и цвета для разовой или регулярной доставки.', variants: [
        ['20 гвоздик', 'Белые', 'carnations-small-white'],
        ['40 гвоздик', 'Нежно-розовые', 'carnations-medium-pink'],
        ['70 гвоздик', 'Айвори и бордовые', 'carnations-large-mixed'],
      ] },
      { title: 'Корзины', description: 'Простые, более наполненные или роскошные цветочные корзины разного размера.', variants: [
        ['Малая', 'Простая и сдержанная', 'basket-small-simple'],
        ['Средняя', 'Наполненная и элегантная', 'basket-medium-elegant'],
        ['Большая', 'Роскошная и объёмная', 'basket-large-luxury'],
      ] },
      { title: 'Букеты', description: 'Смешанные букеты разного объёма в спокойных и достойных цветовых сочетаниях.', variants: [
        ['Малый', 'Сдержанный белый', 'bouquet-small-restrained'],
        ['Средний', 'Айвори и нежно-розовый', 'bouquet-medium-mixed'],
        ['Большой', 'Наполненная смешанная композиция', 'bouquet-large-full'],
      ] },
    ],
    flowerNote: 'На сайте показаны категории, а не товары с фиксированной ценой. Каждый заказ составляется индивидуально.', flowerCta: 'Обсудить заказ цветов',
    coverageKicker: 'В любой точке Армении', coverageTitle: 'Одно контактное лицо для всей страны', coverageText: 'От Еревана до отдалённых населённых пунктов — заранее уточняем дорогу, доступность и возможную дату визита.',
    regions: ['Ереван', 'Арагацотн', 'Арарат', 'Армавир', 'Гегаркуник', 'Котайк', 'Лори', 'Ширак', 'Сюник', 'Тавуш', 'Вайоц Дзор'],
    promiseKicker: 'Наши принципы', promiseTitle: 'Спокойная уверенность без неопределённости', promises: [['Человечное отношение', 'К каждой семейной истории относимся тактично и уважительно.'], ['Никаких работ без согласия', 'Выполняем только подтверждённый вами объём на согласованных условиях.'], ['Честные ожидания', 'Если что-то невозможно выполнить, говорим об этом заранее.'], ['Конфиденциальность', 'Имена, местоположение и отчёты остаются в закрытой переписке.']],
    faqKicker: 'Частые вопросы', faqTitle: 'Короткие ответы на важные вопросы', faqs: [
      ['Как вы находите могилу?', 'Вы можете прислать точную геолокацию, попросить родственника или знакомого проводить сотрудника либо передать имеющиеся данные для поиска. Условия и стоимость поиска всегда обсуждаются заранее в чате.'],
      ['Почему на сайте нет цен?', 'Каждое место и объём работ индивидуальны. Стоимость зависит от состояния, расположения, материалов и периодичности и определяется после предварительной оценки.'],
      ['Вы работаете за пределами Еревана?', 'Да. Мы обслуживаем всю территорию Армении. Для отдалённых населённых пунктов заранее согласовываем дорогу и сроки.'],
      ['Можно заказать регулярный уход?', 'Да. Визиты могут быть ежемесячными, сезонными, к памятным датам или по другому выбранному вами графику.'],
      ['Куда приходят фото и видео?', 'Отчёт отправляется в той же закрытой переписке WhatsApp или Telegram и не становится публичным без вашего разрешения.'],
      ['Как заказать доставку цветов?', 'Сообщите вид, желаемые цвета, количество и дату. Мы предложим доступные варианты, согласуем стоимость и доставим разово или регулярно.'],
    ],
    ctaKicker: 'Начнём с одного сообщения', ctaTitle: 'Расскажите, где находится захоронение и какой уход необходим', ctaText: 'Даже если данных пока мало, напишите нам. Мы поможем определить следующий шаг и подскажем, какая информация нужна.',
    ctaWhats: 'Начать в WhatsApp', ctaTele: 'Начать в Telegram', noCommit: 'Первое обсуждение ни к чему вас не обязывает',
    footerText: 'Расстояние меняет способ заботы, но не саму заботу.', footerNav: 'Навигация', footerContact: 'Связаться', footerPrivacy: 'Принцип конфиденциальности',
    privacyText: 'На сайте не нужна регистрация, данные клиентов и отчёты не публикуются. Полученные при заказе материалы используются только для оказания услуги и личного отчёта.', rights: 'Все права защищены.',
    aiNote: 'Все сцены на сайте созданы ИИ и не изображают реальные захоронения.', backTop: 'Наверх', chatMessage: 'Здравствуйте. Хочу узнать подробнее об услугах I PAH.',
  },
};

const icons = {
  sparkle: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2c.7 5.5 2.5 7.3 8 8-5.5.7-7.3 2.5-8 8-.7-5.5-2.5-7.3-8-8 5.5-.7 7.3-2.5 8-8Z"/><path d="M19 15c.3 2.1.9 2.7 3 3-2.1.3-2.7.9-3 3-.3-2.1-.9-2.7-3-3 2.1-.3 2.7-.9 3-3Z"/></svg>',
  arrow: '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
  check: '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="m4 10 4 4 8-8"/></svg>',
  pin: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  camera: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h3l1.5-2h7L17 7h3v12H4V7Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  lock: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  chat: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.8-4.5A8.5 8.5 0 1 1 21 11.5Z"/></svg>',
  flower: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 11c-5-1-6-7-2-8 3-.7 3 3 2 8Zm0 0c1-5 7-6 8-2 .7 3-3 3-8 2Zm0 0c5 1 6 7 2 8-3 .7-3-3-2-8Zm0 0c-1 5-7 6-8 2-.7-3 3-3 8-2Z"/><circle cx="12" cy="11" r="1.5"/><path d="M12 18v4"/></svg>',
};

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const navLinks = (c, cls = '') => c.nav.map((label, i) => `<a class="${cls}" href="#${c.navIds[i]}">${label}</a>`).join('');
const chatUrl = (channel, c) => channel === 'whatsapp'
  ? `https://wa.me/?text=${encodeURIComponent(c.chatMessage)}`
  : `https://t.me/share/url?url=${encodeURIComponent('https://ipah.am/' + c.lang + '/')}&text=${encodeURIComponent(c.chatMessage)}`;

function logo() {
  return `<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44"><path d="M11 7v30M33 7v30M11 22h22"/><path d="M22 15c5-7 10-5 10-5s0 6-10 7c-4-5-8-3-8-3s0 5 8 6"/></svg></span><span class="brand-words"><strong>I PAH</strong><small>Ի ՊԱՀ</small></span>`;
}

function button(label, channel, c, variant = 'primary') {
  return `<a class="button button--${variant}" href="${chatUrl(channel, c)}" target="_blank" rel="noopener noreferrer" data-chat="${channel}"><span>${label}</span>${icons.arrow}</a>`;
}

function chatChoiceAttributes(c) {
  return `data-chat-choice data-chat-whatsapp="${esc(chatUrl('whatsapp', c))}" data-chat-telegram="${esc(chatUrl('telegram', c))}" aria-haspopup="dialog" aria-controls="chat-picker"`;
}

function chatChoiceButton(label, c, variant = 'primary') {
  return `<button class="button button--${variant} chat-choice-trigger" type="button" ${chatChoiceAttributes(c)}><span>${label}</span>${icons.arrow}</button>`;
}

function chatChoiceTextLink(label, c, classes = 'text-link') {
  return `<button class="${classes} chat-choice-trigger" type="button" ${chatChoiceAttributes(c)}>${label}${icons.arrow}</button>`;
}

const serviceVisuals = [
  [sitePath('/assets/images/services/cleaning-care-960.webp'), 960, 640, 'cleaning'],
  [sitePath('/assets/images/services/landscaping-960.webp'), 960, 640, 'landscaping'],
  [sitePath('/assets/images/services/restoration-960.webp'), 960, 640, 'restoration'],
  [sitePath('/assets/images/services/location-assistance-960.webp'), 960, 640, 'location'],
  [sitePath('/assets/images/services/ongoing-care-report-960.webp'), 960, 640, 'ongoing'],
  [sitePath('/assets/images/services/flower-delivery-960.webp'), 960, 640, 'delivery'],
];

const reportVisuals = ['before', 'during', 'after'];
const reportImageFiles = ['before-v3-960.webp', 'during-v3-960.webp', 'after-v3-960.webp'];

function renderPage(c) {
  const canonical = `https://ipah.am/${c.lang}/`;
  const schema = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'I PAH', alternateName: 'Ի ՊԱՀ', url: canonical,
    image: 'https://ipah.am/assets/images/ipah-hero-1600.webp', description: c.description,
    areaServed: { '@type': 'Country', name: 'Armenia' }, availableLanguage: ['Armenian', 'English', 'Russian'],
    serviceType: ['Grave care', 'Grave cleaning', 'Memorial restoration', 'Grave location assistance', 'Memorial flower delivery'],
  };

  return `<!doctype html>
<html lang="${c.lang}" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${c.title}</title>
  <meta name="description" content="${esc(c.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#173b32">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="hy" href="https://ipah.am/hy/">
  <link rel="alternate" hreflang="en" href="https://ipah.am/en/">
  <link rel="alternate" hreflang="ru" href="https://ipah.am/ru/">
  <link rel="alternate" hreflang="x-default" href="https://ipah.am/hy/">
  <meta property="og:type" content="website"><meta property="og:locale" content="${languages[c.lang].locale}">
  <meta property="og:site_name" content="I PAH"><meta property="og:title" content="${esc(c.title)}"><meta property="og:description" content="${esc(c.description)}">
  <meta property="og:url" content="${canonical}"><meta property="og:image" content="https://ipah.am/assets/images/ipah-hero-1600.webp"><meta property="og:image:alt" content="${esc(c.heroAlt)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(c.title)}"><meta name="twitter:description" content="${esc(c.description)}">
  <link rel="icon" href="${sitePath('/assets/favicon.svg')}" type="image/svg+xml">
  <link rel="manifest" href="${sitePath('/site.webmanifest')}">
  <link rel="preload" as="image" href="${sitePath('/assets/images/ipah-hero-960.webp')}" imagesrcset="${sitePath('/assets/images/ipah-hero-960.webp')} 960w, ${sitePath('/assets/images/ipah-hero-1600.webp')} 1600w" imagesizes="(max-width: 900px) 100vw, 52vw" fetchpriority="high">
  <style>${styles}</style>
  <script>document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');</script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <a class="skip-link" href="#main">${c.skip}</a>
  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="${sitePath(`/${c.lang}/`)}">${logo()}</a>
      <nav class="desktop-nav" aria-label="Primary">${navLinks(c)}</nav>
      <div class="header-actions">
        <div class="language-switcher" data-language>
          <button class="language-button" type="button" aria-expanded="false" aria-controls="language-menu"><span>${languages[c.lang].label}</span><svg aria-hidden="true" viewBox="0 0 12 8"><path d="m1 1 5 5 5-5"/></svg></button>
          <div class="language-menu" id="language-menu" hidden>${Object.entries(languages).map(([code, lang]) => `<a href="${lang.path}" lang="${code}"${code === c.lang ? ' aria-current="page"' : ''}><span>${lang.label}</span><small>${lang.name}</small></a>`).join('')}</div>
        </div>
        <button class="header-cta chat-choice-trigger" type="button" ${chatChoiceAttributes(c)}>${c.talk}${icons.arrow}</button>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${c.menu}" data-menu-toggle><span></span><span></span></button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu" hidden data-mobile-menu><nav aria-label="Mobile">${navLinks(c, 'mobile-link')}</nav><div class="mobile-menu__actions">${button(c.whatsapp, 'whatsapp', c)}${button(c.telegram, 'telegram', c, 'secondary')}</div></div>
  </header>

  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-grid container">
        <div class="hero-copy">
          <p class="eyebrow">${icons.sparkle}${c.heroEyebrow}</p>
          <h1 id="hero-title">${c.heroTitle}</h1>
          <p class="hero-lead">${c.heroText}</p>
          <div class="hero-actions">${button(c.whatsapp, 'whatsapp', c)}${button(c.telegram, 'telegram', c, 'secondary')}</div>
          <p class="response-note"><span aria-hidden="true"></span>${c.response}</p>
        </div>
        <div class="hero-visual">
          <picture><source media="(max-width: 700px)" srcset="${sitePath('/assets/images/ipah-hero-960.webp')}"><img src="${sitePath('/assets/images/ipah-hero-1600.webp')}" srcset="${sitePath('/assets/images/ipah-hero-960.webp')} 960w, ${sitePath('/assets/images/ipah-hero-1600.webp')} 1600w" sizes="(max-width: 900px) 100vw, 52vw" width="1600" height="900" alt="${esc(c.heroAlt)}" fetchpriority="high"></picture>
          <div class="hero-report-card"><div>${icons.camera}<span>${c.heroBadgeTop}</span></div><strong>${c.heroBadgeMain}</strong><small>${c.heroBadgeSub}</small></div>
          <span class="hero-orbit" aria-hidden="true"></span>
        </div>
      </div>
      <div class="trust-strip container">${c.trust.map(([title, text], i) => `<div class="trust-item reveal" style="--delay:${i * 70}ms"><span>0${i + 1}</span><div><strong>${title}</strong><small>${text}</small></div></div>`).join('')}</div>
    </section>

    <section class="intro section" id="about" aria-labelledby="intro-title">
      <div class="container">
        <div class="intro-panel">
          <div class="intro-panel-head"><p class="eyebrow eyebrow--light reveal">${c.introKicker}</p><span class="intro-index" aria-hidden="true"><b>01</b><i></i><small>I PAH</small></span></div>
          <div class="intro-grid">
            <div class="intro-statement"><h2 id="intro-title" class="section-title section-title--light reveal">${c.introTitle}</h2></div>
            <div class="intro-body reveal"><p>${c.introText}</p><div class="privacy-note">${icons.lock}<span>${c.introAside}</span></div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="services section" id="services" aria-labelledby="services-title">
      <div class="container">
        <div class="section-head"><div><p class="eyebrow reveal">${c.servicesKicker}</p><h2 class="section-title reveal" id="services-title">${c.servicesTitle}</h2></div><p class="section-summary reveal">${c.servicesText}</p></div>
        <div class="service-grid">${c.services.map(([title, text, query], i) => { const [src, width, height, kind] = serviceVisuals[i]; return `<article class="service-card reveal" style="--delay:${(i % 3) * 80}ms"><div class="service-media service-media--${kind}"><img src="${src}" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${esc(`${c.serviceImagePrefix}: ${title}`)}"><span class="service-number">0${i + 1}</span></div><div class="service-content"><div class="service-icon">${i === 3 ? icons.pin : i === 5 ? icons.flower : i === 4 ? icons.camera : icons.sparkle}</div><h3>${title}</h3><p>${text}</p>${chatChoiceTextLink(c.discussService, {...c, chatMessage: `${c.chatMessage} ${query}`})}</div></article>`; }).join('')}</div>
      </div>
    </section>

    <section class="process section" id="process" aria-labelledby="process-title">
      <div class="container">
        <div class="process-head"><p class="eyebrow eyebrow--light reveal">${c.processKicker}</p><h2 class="section-title section-title--light reveal" id="process-title">${c.processTitle}</h2><p class="reveal">${c.processText}</p></div>
        <ol class="process-list">${c.steps.map(([title, text], i) => `<li class="process-step reveal" style="--delay:${i * 60}ms"><div class="step-index"><span>${i + 1}</span></div><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol>
        <div class="location-callout reveal"><div class="location-icon">${icons.pin}</div><div><h3>${c.locationNoteTitle}</h3><p>${c.locationNoteText}</p></div>${chatChoiceTextLink(c.locationCta, {...c, chatMessage: `${c.chatMessage} ${c.locationNoteTitle}`}, 'text-link text-link--light')}</div>
      </div>
    </section>

    <section class="report section" id="report" aria-labelledby="report-title">
      <div class="container">
        <div class="report-head"><div class="report-copy"><p class="eyebrow reveal">${c.reportKicker}</p><h2 class="section-title reveal" id="report-title">${c.reportTitle}</h2></div><div class="report-meta reveal"><span class="report-private">${icons.lock}${c.privateLabel}</span><p>${c.reportText}</p></div></div>
        <div class="report-story reveal">${c.reportCards.map(([title, text], i) => `<figure class="report-stage report-stage--${reportVisuals[i]}"><div class="report-stage-media"><img src="${sitePath(`/assets/images/report/${reportImageFiles[i]}`)}" width="960" height="640" loading="lazy" decoding="async" alt="${esc(c.reportAlts[i])}"><span class="report-stage-count"><b>${String(i + 1).padStart(2, '0')}</b><small>/ 03</small></span></div><figcaption><strong>${title}</strong><small>${text}</small></figcaption></figure>`).join('')}</div>
      </div>
    </section>

    <section class="plans section" aria-labelledby="plans-title">
      <div class="container"><div class="section-head"><div><p class="eyebrow reveal">${c.plansKicker}</p><h2 class="section-title reveal" id="plans-title">${c.plansTitle}</h2></div><p class="price-note reveal">${c.noPrice}</p></div>
        <div class="plan-grid"><article class="plan-card reveal"><span class="plan-chip">01</span><h3>${c.onceTitle}</h3><p>${c.onceText}</p><ul>${c.onceList.map(v => `<li>${icons.check}${v}</li>`).join('')}</ul>${chatChoiceTextLink(c.plansCta, {...c, chatMessage: `${c.chatMessage} ${c.onceTitle}`})}</article><article class="plan-card plan-card--featured reveal reveal--delay-1"><span class="plan-chip">∞</span><h3>${c.regularTitle}</h3><p>${c.regularText}</p><ul>${c.regularList.map(v => `<li>${icons.check}${v}</li>`).join('')}</ul>${chatChoiceTextLink(c.plansCta, {...c, chatMessage: `${c.chatMessage} ${c.regularTitle}`})}</article></div>
      </div>
    </section>

    <section class="flowers section" id="flowers" aria-labelledby="flowers-title">
      <div class="container">
        <div class="flowers-grid">
          <div class="flowers-copy"><p class="eyebrow reveal">${c.flowersKicker}</p><h2 class="section-title reveal" id="flowers-title">${c.flowersTitle}</h2><p class="section-summary reveal">${c.flowersText}</p><div class="flower-types reveal">${c.flowerCatalog.map((category, i) => `<span><b>${String(i + 1).padStart(2, '0')}</b>${category.title}</span>`).join('')}</div><p class="flower-note reveal">${c.flowerNote}</p><div class="reveal">${chatChoiceButton(c.flowerCta, {...c, chatMessage: `${c.chatMessage} ${c.flowerCta}`})}</div></div>
          <div class="flowers-visual reveal reveal--image"><picture><source media="(max-width:700px)" srcset="${sitePath('/assets/images/ipah-flowers-720.webp')}"><img src="${sitePath('/assets/images/ipah-flowers-1200.webp')}" srcset="${sitePath('/assets/images/ipah-flowers-720.webp')} 720w, ${sitePath('/assets/images/ipah-flowers-1200.webp')} 1200w" sizes="(max-width:900px) 100vw, 48vw" width="1200" height="800" loading="lazy" decoding="async" alt="${esc(c.flowersAlt)}"></picture><div class="flower-caption">I PAH <span>FLOWERS</span></div></div>
        </div>
        <div class="flower-catalog-wrap">
          <div class="flower-carousel reveal" data-flower-carousel data-autoplay="3000" data-manual-pause="8000" aria-label="${esc(c.flowerCarouselLabel)}" aria-roledescription="carousel">
            <div class="flower-carousel-controls">
              <div class="flower-carousel-status" aria-live="polite" aria-atomic="true"><strong data-flower-current>01</strong><span aria-hidden="true"></span><small>05</small></div>
              <div class="flower-carousel-tabs" role="tablist" aria-label="${esc(c.flowerCarouselLabel)}">${c.flowerCatalog.map((category, i) => `<button id="flower-tab-${c.lang}-${i + 1}" type="button" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="flower-slide-${c.lang}-${i + 1}" aria-label="${esc(`${c.flowerSlideLabel} ${String(i + 1).padStart(2, '0')}: ${category.title}`)}" data-flower-tab="${i}">${String(i + 1).padStart(2, '0')}</button>`).join('')}</div>
              <div class="flower-carousel-arrows"><button class="flower-carousel-arrow flower-carousel-arrow--prev" type="button" aria-label="${esc(c.flowerPrevious)}" data-flower-prev>${icons.arrow}</button><button class="flower-carousel-arrow" type="button" aria-label="${esc(c.flowerNext)}" data-flower-next>${icons.arrow}</button></div>
              <div class="flower-carousel-progress" aria-hidden="true"><span></span></div>
            </div>
            <div class="flower-carousel-viewport" data-flower-viewport><div class="flower-catalog" data-flower-track>${c.flowerCatalog.map((category, i) => `<div class="flower-category" id="flower-slide-${c.lang}-${i + 1}" role="tabpanel" aria-labelledby="flower-tab-${c.lang}-${i + 1}" aria-hidden="${i === 0 ? 'false' : 'true'}"${i === 0 ? ' data-active="true"' : ' inert'}><header class="flower-category-head"><span class="flower-category-number">${String(i + 1).padStart(2, '0')}</span><div><h3>${category.title}</h3><p>${category.description}</p></div>${chatChoiceTextLink(c.flowerDiscuss, {...c, chatMessage: `${c.chatMessage} ${category.title}`})}</header><div class="flower-product-grid">${category.variants.map(([label, detail, asset], j) => `<figure class="flower-product-card flower-product-card--${j + 1}" style="--card-index:${j}"><img src="${sitePath(`/assets/images/flowers/${asset}.webp`)}" width="900" height="1125" loading="lazy" decoding="async" alt="${esc(`${c.flowerImagePrefix}: ${category.title}, ${label}, ${detail}`)}"><span class="flower-example">${c.flowerExample}</span><figcaption><strong>${label}</strong><small>${detail}</small></figcaption></figure>`).join('')}</div></div>`).join('')}</div></div>
            <div class="flower-floating-controls" data-flower-floating aria-hidden="true" inert><button class="flower-carousel-arrow flower-carousel-arrow--prev" type="button" aria-label="${esc(c.flowerPrevious)}" data-flower-floating-prev>${icons.arrow}</button><span class="flower-floating-status" aria-live="polite" aria-atomic="true"><strong data-flower-floating-current>01</strong><small>/ 05</small></span><button class="flower-carousel-arrow" type="button" aria-label="${esc(c.flowerNext)}" data-flower-floating-next>${icons.arrow}</button></div>
          </div>
        </div>
      </div>
    </section>

    <section class="coverage section" aria-labelledby="coverage-title">
      <div class="container coverage-grid">
        <div class="coverage-copy"><p class="eyebrow eyebrow--light reveal">${c.coverageKicker}</p><h2 class="section-title section-title--light reveal" id="coverage-title">${c.coverageTitle}</h2><p class="reveal">${c.coverageText}</p></div>
        <div class="coverage-map reveal" aria-hidden="true"><div class="map-ring map-ring--one"></div><div class="map-ring map-ring--two"></div><div class="map-center"><span>I PAH</span><small>AM</small></div>${[0,1,2,3,4,5].map(i => `<i style="--i:${i}"></i>`).join('')}</div>
        <div class="region-list reveal">${c.regions.map(v => `<span>${icons.pin}${v}</span>`).join('')}</div>
      </div>
    </section>

    <section class="promise section" id="promise" aria-labelledby="promise-title"><div class="container"><div class="section-head"><div><p class="eyebrow reveal">${c.promiseKicker}</p><h2 class="section-title reveal" id="promise-title">${c.promiseTitle}</h2></div></div><div class="promise-grid">${c.promises.map(([title, text], i) => `<article class="promise-card reveal" style="--delay:${i * 70}ms"><span>${icons.check}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div></section>

    <section class="faq section" id="faq" aria-labelledby="faq-title"><div class="container faq-grid"><div class="faq-heading"><p class="eyebrow reveal">${c.faqKicker}</p><h2 class="section-title reveal" id="faq-title">${c.faqTitle}</h2><div class="faq-motif" aria-hidden="true">?</div></div><div class="faq-list">${c.faqs.map(([q,a],i) => `<details class="faq-item reveal"${i === 0 ? ' open' : ''}><summary><span>${q}</span><i></i></summary><div><p>${a}</p></div></details>`).join('')}</div></div></section>

    <section class="contact section" id="contact" aria-labelledby="contact-title"><div class="container"><div class="contact-card"><div class="contact-orbit" aria-hidden="true"></div><p class="eyebrow eyebrow--light reveal">${c.ctaKicker}</p><h2 class="section-title section-title--light reveal" id="contact-title">${c.ctaTitle}</h2><p class="reveal">${c.ctaText}</p><div class="contact-actions reveal">${button(c.ctaWhats, 'whatsapp', c, 'light')}${button(c.ctaTele, 'telegram', c, 'outline-light')}</div><small class="reveal">${icons.check}${c.noCommit}</small></div></div></section>
  </main>

  <footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="brand brand--footer" href="${sitePath(`/${c.lang}/`)}">${logo()}</a><p>${c.footerText}</p><small>${c.aiNote}</small></div><div><h2>${c.footerNav}</h2><nav>${navLinks(c)}</nav></div><div><h2>${c.footerContact}</h2><a href="${chatUrl('whatsapp', c)}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="${chatUrl('telegram', c)}" target="_blank" rel="noopener noreferrer">Telegram</a></div><div id="privacy"><h2>${c.footerPrivacy}</h2><p>${c.privacyText}</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} I PAH. ${c.rights}</span><a href="#main">${c.backTop}${icons.arrow}</a></div></footer>
  <div class="mobile-contact-bar" aria-label="${c.footerContact}"><a href="${chatUrl('whatsapp', c)}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="${chatUrl('telegram', c)}" target="_blank" rel="noopener noreferrer">Telegram</a></div>
  <dialog class="chat-picker" id="chat-picker" aria-labelledby="chat-picker-title" aria-describedby="chat-picker-copy" data-chat-picker>
    <div class="chat-picker-card">
      <button class="chat-picker-close" type="button" aria-label="${esc(c.chatPickerClose)}" data-chat-picker-close><span></span><span></span></button>
      <p class="eyebrow">${icons.chat}${c.chatPickerKicker}</p>
      <h2 id="chat-picker-title">${c.chatPickerTitle}</h2>
      <p id="chat-picker-copy">${c.chatPickerText}</p>
      <div class="chat-picker-options">
        <a class="chat-option chat-option--whatsapp" href="${chatUrl('whatsapp', c)}" target="_blank" rel="noopener noreferrer" data-chat-picker-whatsapp><span class="chat-option-mark">WA</span><span><strong>WhatsApp</strong><small>${c.whatsapp}</small></span>${icons.arrow}</a>
        <a class="chat-option chat-option--telegram" href="${chatUrl('telegram', c)}" target="_blank" rel="noopener noreferrer" data-chat-picker-telegram><span class="chat-option-mark">TG</span><span><strong>Telegram</strong><small>${c.telegram}</small></span>${icons.arrow}</a>
      </div>
      <div class="chat-picker-privacy">${icons.lock}<span>${c.chatPickerPrivacy}</span></div>
    </div>
  </dialog>
  <script src="${sitePath('/assets/main.js')}?v=${mainScriptVersion}" defer></script>
</body>
</html>`;
}

for (const [code, content] of Object.entries(copy)) {
  const dir = resolve(outputRoot, code);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'index.html'), renderPage(content).replace(/>\s+</g, '><').trim());
}

const rootPage = `<!doctype html><html lang="hy"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>I PAH</title><link rel="canonical" href="https://ipah.am/hy/"><meta http-equiv="refresh" content="0;url=${sitePath('/hy/')}"><script>const l=(navigator.language||'hy').slice(0,2),b=${JSON.stringify(basePath)};location.replace(b+'/'+(['hy','en','ru'].includes(l)?l:'hy')+'/');</script></head><body><p><a href="${sitePath('/hy/')}">Հայերեն</a> · <a href="${sitePath('/en/')}">English</a> · <a href="${sitePath('/ru/')}">Русский</a></p></body></html>`;
await writeFile(resolve(outputRoot, 'index.html'), rootPage);
