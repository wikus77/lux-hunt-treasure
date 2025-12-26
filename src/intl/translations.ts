// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

type SupportedLanguage = 'en' | 'it' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ar';

interface LandingPageTranslations {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  joinTheHunt: string;
  learnMore: string;
  missionStartsOn: string;
  realPrizes: string;
  realPrizesDescription: string;
  imageRepresentation: string;
  welcomeToMission: string;
  registerForMission: string;
  startMission: string;
  discoverMission: string;
  gdpr: {
    cookieTitle: string;
    cookieDescription: string;
    cookieSettings: string;
    cookiePreferences: string;
    acceptAll: string;
    rejectAll: string;
    saveSettings: string;
    required: string;
    necessaryCookies: string;
    necessaryDescription: string;
    functionalCookies: string;
    functionalDescription: string;
    analyticsCookies: string;
    analyticsDescription: string;
    marketingCookies: string;
    marketingDescription: string;
  };
}

export const landingTranslations: Record<SupportedLanguage, LandingPageTranslations> = {
  en: {
    heroTitle: "M1SSION™",
    heroSubtitle: "The Ultimate Challenge",
    heroDescription: "Every month, one real prize. Thousands compete. Only one wins. This is not luck. It's pattern recognition.",
    joinTheHunt: "TEST YOURSELF",
    learnMore: "HOW IT WORKS",
    missionStartsOn: "M1SSION STARTS ON 19 AUGUST",
    realPrizes: "REAL PRIZES",
    realPrizesDescription: "Real delivery to the winner. No simulation. If you're the first to arrive, it's yours.",
    imageRepresentation: "Image for representation purposes",
    welcomeToMission: "WELCOME TO M1SSION™",
    registerForMission: "Register for M1SSION™",
    startMission: "START M1SSION",
    discoverMission: "Discover M1SSION",
    gdpr: {
      cookieTitle: "Cookie Settings",
      cookieDescription: "We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By clicking \"Accept All\", you consent to our use of cookies.",
      cookieSettings: "Cookie Settings",
      cookiePreferences: "Cookie Preferences",
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      saveSettings: "Save Settings",
      required: "Required",
      necessaryCookies: "Necessary Cookies",
      necessaryDescription: "Essential for the website to function properly. Cannot be disabled.",
      functionalCookies: "Functional Cookies",
      functionalDescription: "Enable enhanced functionality and personalization.",
      analyticsCookies: "Analytics Cookies",
      analyticsDescription: "Help us understand how visitors interact with the website.",
      marketingCookies: "Marketing Cookies",
      marketingDescription: "Used to track visitors and display relevant ads."
    }
  },
  it: {
    heroTitle: "M1SSION™",
    heroSubtitle: "La Sfida Definitiva",
    heroDescription: "Ogni mese un premio reale. Migliaia partecipano. Uno solo vince. Non è fortuna. È pattern recognition.",
    joinTheHunt: "METTITI ALLA PROVA",
    learnMore: "COME FUNZIONA",
    missionStartsOn: "M1SSION INIZIA IL 19 AGOSTO",
    realPrizes: "PREMI REALI",
    realPrizesDescription: "Consegna reale al vincitore. Nessuna simulazione. Se arrivi primo, è tuo.",
    imageRepresentation: "Immagine a scopo rappresentativo",
    welcomeToMission: "BENVENUTO IN M1SSION™",
    registerForMission: "Registrati per M1SSION™",
    startMission: "INIZIA M1SSION",
    discoverMission: "Scopri M1SSION",
    gdpr: {
      cookieTitle: "Impostazioni Cookie",
      cookieDescription: "Utilizziamo i cookie per migliorare la tua esperienza, analizzare l'utilizzo del sito e assistere nei nostri sforzi di marketing. Cliccando \"Accetta Tutto\", acconsenti all'uso dei nostri cookie.",
      cookieSettings: "Impostazioni Cookie",
      cookiePreferences: "Preferenze Cookie",
      acceptAll: "Accetta Tutto",
      rejectAll: "Rifiuta Tutto",
      saveSettings: "Salva Impostazioni",
      required: "Richiesto",
      necessaryCookies: "Cookie Necessari",
      necessaryDescription: "Essenziali per il corretto funzionamento del sito web. Non possono essere disabilitati.",
      functionalCookies: "Cookie Funzionali",
      functionalDescription: "Abilitano funzionalità avanzate e personalizzazione.",
      analyticsCookies: "Cookie Analytics",
      analyticsDescription: "Ci aiutano a capire come i visitatori interagiscono con il sito web.",
      marketingCookies: "Cookie Marketing",
      marketingDescription: "Utilizzati per tracciare i visitatori e mostrare annunci pertinenti."
    }
  },
  fr: {
    heroTitle: "M1SSION™",
    heroSubtitle: "Le Défi Ultime",
    heroDescription: "Un prix attend ceux qui savent voir au-delà. Les indices ne sont pas cachés : ils sont déguisés. Il faut de la logique, de la froideur et de la vision. Le défi a commencé.",
    joinTheHunt: "REJOIGNEZ LA CHASSE",
    learnMore: "EN SAVOIR PLUS",
    missionStartsOn: "M1SSION COMMENCE LE 19 AOÛT",
    realPrizes: "VRAIS PRIX",
    realPrizesDescription: "Pas de simulations. Pas de jetons virtuels. Des prix tangibles que vous pouvez toucher, utiliser, posséder.",
    imageRepresentation: "Image à des fins de représentation",
    welcomeToMission: "BIENVENUE DANS M1SSION™",
    registerForMission: "S'inscrire à M1SSION™",
    startMission: "COMMENCER M1SSION",
    discoverMission: "Découvrir M1SSION",
    gdpr: {
      cookieTitle: "Paramètres des Cookies",
      cookieDescription: "Nous utilisons des cookies pour améliorer votre expérience, analyser l'utilisation du site et assister dans nos efforts marketing. En cliquant sur \"Tout Accepter\", vous consentez à notre utilisation des cookies.",
      cookieSettings: "Paramètres des Cookies",
      cookiePreferences: "Préférences des Cookies",
      acceptAll: "Tout Accepter",
      rejectAll: "Tout Rejeter",
      saveSettings: "Sauvegarder les Paramètres",
      required: "Requis",
      necessaryCookies: "Cookies Nécessaires",
      necessaryDescription: "Essentiels pour le bon fonctionnement du site web. Ne peuvent pas être désactivés.",
      functionalCookies: "Cookies Fonctionnels",
      functionalDescription: "Permettent des fonctionnalités améliorées et la personnalisation.",
      analyticsCookies: "Cookies Analytics",
      analyticsDescription: "Nous aident à comprendre comment les visiteurs interagissent avec le site web.",
      marketingCookies: "Cookies Marketing",
      marketingDescription: "Utilisés pour suivre les visiteurs et afficher des publicités pertinentes."
    }
  },
  es: {
    heroTitle: "M1SSION™",
    heroSubtitle: "El Desafío Definitivo",
    heroDescription: "Un premio espera a quienes saben ver más allá. Las pistas no están ocultas: están disfrazadas. Requiere lógica, frialdad y visión. El desafío ha comenzado.",
    joinTheHunt: "ÚNETE A LA CAZA",
    learnMore: "SABER MÁS",
    missionStartsOn: "M1SSION COMIENZA EL 19 DE AGOSTO",
    realPrizes: "PREMIOS REALES",
    realPrizesDescription: "No simulaciones. No tokens virtuales. Premios tangibles que puedes tocar, usar, poseer.",
    imageRepresentation: "Imagen con fines representativos",
    welcomeToMission: "BIENVENIDO A M1SSION™",
    registerForMission: "Regístrate para M1SSION™",
    startMission: "INICIAR M1SSION",
    discoverMission: "Descubrir M1SSION",
    gdpr: {
      cookieTitle: "Configuración de Cookies",
      cookieDescription: "Utilizamos cookies para mejorar tu experiencia, analizar el uso del sitio y asistir en nuestros esfuerzos de marketing. Al hacer clic en \"Aceptar Todo\", consientes nuestro uso de cookies.",
      cookieSettings: "Configuración de Cookies",
      cookiePreferences: "Preferencias de Cookies",
      acceptAll: "Aceptar Todo",
      rejectAll: "Rechazar Todo",
      saveSettings: "Guardar Configuración",
      required: "Requerido",
      necessaryCookies: "Cookies Necesarias",
      necessaryDescription: "Esenciales para el funcionamiento correcto del sitio web. No se pueden desactivar.",
      functionalCookies: "Cookies Funcionales",
      functionalDescription: "Permiten funcionalidad mejorada y personalización.",
      analyticsCookies: "Cookies Analytics",
      analyticsDescription: "Nos ayudan a entender cómo los visitantes interactúan con el sitio web.",
      marketingCookies: "Cookies Marketing",
      marketingDescription: "Utilizadas para rastrear visitantes y mostrar anuncios relevantes."
    }
  },
  de: {
    heroTitle: "M1SSION™",
    heroSubtitle: "Die Ultimative Herausforderung",
    heroDescription: "Ein Preis wartet auf diejenigen, die über das Offensichtliche hinaussehen können. Die Hinweise sind nicht versteckt: sie sind getarnt. Es erfordert Logik, Kälte und Vision. Die Herausforderung hat begonnen.",
    joinTheHunt: "DER JAGD BEITRETEN",
    learnMore: "MEHR ERFAHREN",
    missionStartsOn: "M1SSION BEGINNT AM 19. AUGUST",
    realPrizes: "ECHTE PREISE",
    realPrizesDescription: "Keine Simulationen. Keine virtuellen Token. Greifbare Preise, die Sie berühren, verwenden, besitzen können.",
    imageRepresentation: "Bild zu Darstellungszwecken",
    welcomeToMission: "WILLKOMMEN BEI M1SSION™",
    registerForMission: "Für M1SSION™ registrieren",
    startMission: "M1SSION STARTEN",
    discoverMission: "M1SSION Entdecken",
    gdpr: {
      cookieTitle: "Cookie-Einstellungen",
      cookieDescription: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern, die Nutzung der Website zu analysieren und bei unseren Marketingbemühungen zu helfen. Durch Klicken auf \"Alle Akzeptieren\" stimmen Sie unserer Verwendung von Cookies zu.",
      cookieSettings: "Cookie-Einstellungen",
      cookiePreferences: "Cookie-Präferenzen",
      acceptAll: "Alle Akzeptieren",
      rejectAll: "Alle Ablehnen",
      saveSettings: "Einstellungen Speichern",
      required: "Erforderlich",
      necessaryCookies: "Notwendige Cookies",
      necessaryDescription: "Wesentlich für das ordnungsgemäße Funktionieren der Website. Können nicht deaktiviert werden.",
      functionalCookies: "Funktionale Cookies",
      functionalDescription: "Ermöglichen erweiterte Funktionalität und Personalisierung.",
      analyticsCookies: "Analytics Cookies",
      analyticsDescription: "Helfen uns zu verstehen, wie Besucher mit der Website interagieren.",
      marketingCookies: "Marketing Cookies",
      marketingDescription: "Werden verwendet, um Besucher zu verfolgen und relevante Werbung anzuzeigen."
    }
  },
  pt: {
    heroTitle: "M1SSION™",
    heroSubtitle: "O Desafio Definitivo",
    heroDescription: "Um prêmio aguarda aqueles que sabem ver além. As pistas não estão escondidas: estão disfarçadas. Requer lógica, frieza e visão. O desafio começou.",
    joinTheHunt: "JUNTE-SE À CAÇADA",
    learnMore: "SABER MAIS",
    missionStartsOn: "M1SSION COMEÇA EM 19 DE AGOSTO",
    realPrizes: "PRÊMIOS REAIS",
    realPrizesDescription: "Não simulações. Não tokens virtuais. Prêmios tangíveis que você pode tocar, usar, possuir.",
    imageRepresentation: "Imagem para fins de representação",
    welcomeToMission: "BEM-VINDO À M1SSION™",
    registerForMission: "Registre-se para M1SSION™",
    startMission: "INICIAR M1SSION",
    discoverMission: "Descobrir M1SSION",
    gdpr: {
      cookieTitle: "Configurações de Cookies",
      cookieDescription: "Usamos cookies para melhorar sua experiência, analisar o uso do site e auxiliar em nossos esforços de marketing. Ao clicar em \"Aceitar Tudo\", você consente com nosso uso de cookies.",
      cookieSettings: "Configurações de Cookies",
      cookiePreferences: "Preferências de Cookies",
      acceptAll: "Aceitar Tudo",
      rejectAll: "Rejeitar Tudo",
      saveSettings: "Salvar Configurações",
      required: "Obrigatório",
      necessaryCookies: "Cookies Necessários",
      necessaryDescription: "Essenciais para o funcionamento adequado do site. Não podem ser desabilitados.",
      functionalCookies: "Cookies Funcionais",
      functionalDescription: "Permitem funcionalidade aprimorada e personalização.",
      analyticsCookies: "Cookies Analytics",
      analyticsDescription: "Nos ajudam a entender como os visitantes interagem com o site.",
      marketingCookies: "Cookies Marketing",
      marketingDescription: "Usados para rastrear visitantes e exibir anúncios relevantes."
    }
  },
  zh: {
    heroTitle: "M1SSION™",
    heroSubtitle: "终极挑战",
    heroDescription: "奖品等待着那些能够看得更远的人。线索并非隐藏：它们被伪装了。需要逻辑、冷静和远见。挑战已经开始。",
    joinTheHunt: "加入狩猎",
    learnMore: "了解更多",
    missionStartsOn: "M1SSION 将于 8 月 19 日开始",
    realPrizes: "真实奖品",
    realPrizesDescription: "不是模拟。不是虚拟代币。您可以触摸、使用、拥有的有形奖品。",
    imageRepresentation: "图像仅供参考",
    welcomeToMission: "欢迎来到 M1SSION™",
    registerForMission: "注册 M1SSION™",
    startMission: "开始 M1SSION",
    discoverMission: "发现 M1SSION",
    gdpr: {
      cookieTitle: "Cookie 设置",
      cookieDescription: "我们使用 cookie 来增强您的体验，分析网站使用情况，并协助我们的营销工作。点击\"全部接受\"，即表示您同意我们使用 cookie。",
      cookieSettings: "Cookie 设置",
      cookiePreferences: "Cookie 偏好",
      acceptAll: "全部接受",
      rejectAll: "全部拒绝",
      saveSettings: "保存设置",
      required: "必需",
      necessaryCookies: "必要 Cookie",
      necessaryDescription: "网站正常运行所必需的。无法禁用。",
      functionalCookies: "功能性 Cookie",
      functionalDescription: "启用增强功能和个性化。",
      analyticsCookies: "分析 Cookie",
      analyticsDescription: "帮助我们了解访问者如何与网站互动。",
      marketingCookies: "营销 Cookie",
      marketingDescription: "用于跟踪访问者并显示相关广告。"
    }
  },
  ar: {
    heroTitle: "M1SSION™",
    heroSubtitle: "التحدي النهائي",
    heroDescription: "جائزة تنتظر أولئك الذين يستطيعون الرؤية أبعد من الواضح. الأدلة ليست مخفية: إنها مقنعة. تتطلب منطقًا وبرودة ورؤية. لقد بدأ التحدي.",
    joinTheHunt: "انضم للصيد",
    learnMore: "اعرف المزيد",
    missionStartsOn: "M1SSION تبدأ في 19 أغسطس",
    realPrizes: "جوائز حقيقية",
    realPrizesDescription: "ليست محاكاة. ليست رموزًا افتراضية. جوائز ملموسة يمكنك لمسها واستخدامها وامتلاكها.",
    imageRepresentation: "صورة لأغراض التمثيل",
    welcomeToMission: "مرحبًا بك في M1SSION™",
    registerForMission: "سجل في M1SSION™",
    startMission: "ابدأ M1SSION",
    discoverMission: "اكتشف M1SSION",
    gdpr: {
      cookieTitle: "إعدادات ملفات تعريف الارتباط",
      cookieDescription: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع والمساعدة في جهودنا التسويقية. بالنقر على \"قبول الكل\"، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
      cookieSettings: "إعدادات ملفات تعريف الارتباط",
      cookiePreferences: "تفضيلات ملفات تعريف الارتباط",
      acceptAll: "قبول الكل",
      rejectAll: "رفض الكل",
      saveSettings: "حفظ الإعدادات",
      required: "مطلوب",
      necessaryCookies: "ملفات تعريف الارتباط الضرورية",
      necessaryDescription: "ضرورية للتشغيل السليم للموقع. لا يمكن تعطيلها.",
      functionalCookies: "ملفات تعريف الارتباط الوظيفية",
      functionalDescription: "تمكن الوظائف المحسنة والتخصيص.",
      analyticsCookies: "ملفات تعريف الارتباط التحليلية",
      analyticsDescription: "تساعدنا على فهم كيفية تفاعل الزوار مع الموقع.",
      marketingCookies: "ملفات تعريف الارتباط التسويقية",
      marketingDescription: "تُستخدم لتتبع الزوار وعرض الإعلانات ذات الصلة."
    }
  }
};