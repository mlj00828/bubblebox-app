// Translations for the cleaner-facing pages (/join and /pro).
// Spanish and Portuguese are included because a large share of Atlanta's
// cleaning workforce speaks them at home. Keep the wording plain — this is
// people deciding whether to trust us with their income.

export type Lang = "en" | "es" | "pt";

export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "pt", label: "Português", flag: "🇧🇷" },
];

export interface JoinCopy {
  // hero
  hiringBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSub: string;
  // perks
  perksEyebrow: string;
  perksTitle: string;
  perks: { icon: string; title: string; desc: string }[];
  // steps
  stepsEyebrow: string;
  stepsTitle: string;
  stepsSub: string;
  steps: { num: string; title: string; desc: string }[];
  // form
  formEyebrow: string;
  formTitle: string;
  formCardTitle: string;
  formCardSub: string;
  secPersonal: string;
  secExperience: string;
  secAvailability: string;
  secLogistics: string;
  secConsent: string;
  firstName: string;
  lastName: string;
  emailLabel: string;
  phoneLabel: string;
  zipLabel: string;
  experienceLabel: string;
  bioLabel: string;
  bioPlaceholder: string;
  servicesLabel: string;
  daysLabel: string;
  hoursLabel: string;
  transportLabel: string;
  suppliesLabel: string;
  yes: string;
  no: string;
  // consent
  workAuthTitle: string;
  workAuthText: string;
  idConsentTitle: string;
  idConsentText: string;
  termsTitle: string;
  termsText: string;
  termsLink: string;
  privacyLink: string;
  submit: string;
  submitting: string;
  // errors
  errName: string;
  errEmail: string;
  errPhone: string;
  errZip: string;
  errServices: string;
  errDays: string;
  errTransport: string;
  errConsent: string;
  errWorkAuth: string;
  errNetwork: string;
  // success
  successTitle: string;
  successBody: string;
  successSteps: string[];
  backHome: string;
  // option labels
  services: Record<string, string>;
  days: Record<string, string>;
  hours: Record<string, string>;
  experience: { value: string; label: string }[];
}

const en: JoinCopy = {
  hiringBadge: "Now Hiring in Atlanta",
  heroTitle1: "Get paid to clean.",
  heroTitle2: "On your schedule.",
  heroSub:
    "Join the BubbleBox ATL team and build a flexible cleaning career. Weekly pay, great customers, and work close to home.",
  perksEyebrow: "Why BubbleBox",
  perksTitle: "A cleaning job that works for you",
  perks: [
    { icon: "💵", title: "Weekly Pay", desc: "Paid every Friday for the week's work. You keep 80% of what the customer pays — a $169 deep clean pays you $135.20." },
    { icon: "🗓️", title: "Flexible Schedule", desc: "You choose when you work. Set your own availability and take the days off you need." },
    { icon: "📍", title: "Work Close to Home", desc: "We match you with jobs in your ZIP codes to keep your commute short and your earnings high." },
    { icon: "💰", title: "Keep Your Tips", desc: "100% of customer tips go directly to you. Great service means great extra income." },
    { icon: "📋", title: "Clear Standards", desc: "You get our written room-by-room checklist, so you always know exactly what a job requires." },
    { icon: "📱", title: "Simple Dashboard", desc: "See job offers, accept work, track your earnings and mark jobs complete — all from your phone." },
  ],
  stepsEyebrow: "Simple Process",
  stepsTitle: "How to get started",
  stepsSub: "From application to your first job in as little as 3–5 business days.",
  steps: [
    { num: "1", title: "Apply Online", desc: "Fill out the short application below. Takes about 5 minutes." },
    { num: "2", title: "Quick Interview", desc: "A short phone or video call to get to know you and answer your questions." },
    { num: "3", title: "ID Verification", desc: "We verify your government-issued ID on the call. No cost to you." },
    { num: "4", title: "Start Earning", desc: "Get approved and start receiving job offers in your area right away." },
  ],
  formEyebrow: "Application",
  formTitle: "Apply to join the team",
  formCardTitle: "Cleaner Application",
  formCardSub: "All fields marked with * are required. Takes about 5 minutes.",
  secPersonal: "Personal Information",
  secExperience: "Experience",
  secAvailability: "Availability",
  secLogistics: "Logistics",
  secConsent: "Consent & Agreement",
  firstName: "First Name",
  lastName: "Last Name",
  emailLabel: "Email Address",
  phoneLabel: "Phone Number",
  zipLabel: "Home ZIP Code",
  experienceLabel: "Years of cleaning experience",
  bioLabel: "Tell us about yourself",
  bioPlaceholder: "Why do you want to join BubbleBox? Any relevant experience or skills?",
  servicesLabel: "Service types you're comfortable with",
  daysLabel: "Days available",
  hoursLabel: "Preferred hours",
  transportLabel: "Reliable transportation?",
  suppliesLabel: "Do you have your own cleaning supplies?",
  yes: "Yes",
  no: "No",
  workAuthTitle: "Work authorization",
  workAuthText:
    "I am legally authorized to work as an independent contractor in the United States. I understand a W-9 with a valid SSN or ITIN is required before my first payout.",
  idConsentTitle: "Identity verification consent",
  idConsentText:
    "I agree to verify my government-issued ID during my interview call, as required for anyone entering customers' homes.",
  termsTitle: "Terms agreement",
  termsText: "I have read and agree to the",
  termsLink: "Terms of Service",
  privacyLink: "Privacy Policy",
  submit: "Submit Application →",
  submitting: "Submitting…",
  errName: "Please enter your full name.",
  errEmail: "Please enter a valid email.",
  errPhone: "Please enter a valid US phone number.",
  errZip: "Please enter your 5-digit ZIP code.",
  errServices: "Please select at least one service type.",
  errDays: "Please select at least one available day.",
  errTransport: "Please tell us about your transportation.",
  errConsent: "Please check all the boxes to continue.",
  errWorkAuth: "You must confirm you're authorized to work as an independent contractor.",
  errNetwork: "Couldn't reach the server. Please check your connection and try again.",
  successTitle: "Application submitted!",
  successBody:
    "Thanks for applying to BubbleBox ATL! We'll review your application and reach out within 2–3 business days.",
  successSteps: [
    "We'll review your application",
    "We'll email you a link to schedule your interview",
    "We'll verify your ID on the call",
    "Get approved and start earning!",
  ],
  backHome: "Back to Home",
  services: {
    "standard-cleaning": "🧹 Standard Cleaning",
    "deep-cleaning": "✨ Deep Cleaning",
    "airbnb-turnover": "🏠 Airbnb Turnover",
    "move-in-out": "📦 Move In/Out",
    "post-construction": "🏗️ Post-Construction",
    "office-cleaning": "🏢 Office/Commercial",
  },
  days: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
  hours: {
    morning: "☀️ Morning (8am–12pm)",
    afternoon: "🌤️ Afternoon (12pm–5pm)",
    evening: "🌙 Evening (5pm–8pm)",
    flexible: "🔄 Flexible / Any time",
  },
  experience: [
    { value: "", label: "Select experience level" },
    { value: "none", label: "No experience — willing to learn" },
    { value: "<1", label: "Less than 1 year" },
    { value: "1-2", label: "1–2 years" },
    { value: "3-5", label: "3–5 years" },
    { value: "5+", label: "5+ years" },
  ],
};

const es: JoinCopy = {
  hiringBadge: "Contratando en Atlanta",
  heroTitle1: "Gana dinero limpiando.",
  heroTitle2: "En tu propio horario.",
  heroSub:
    "Únete al equipo de BubbleBox ATL y construye una carrera flexible en limpieza. Pago semanal, buenos clientes y trabajo cerca de casa.",
  perksEyebrow: "Por qué BubbleBox",
  perksTitle: "Un trabajo de limpieza que funciona para ti",
  perks: [
    { icon: "💵", title: "Pago Semanal", desc: "Te pagamos todos los viernes por el trabajo de la semana. Te quedas con el 80% de lo que paga el cliente — una limpieza profunda de $169 te paga $135.20." },
    { icon: "🗓️", title: "Horario Flexible", desc: "Tú eliges cuándo trabajas. Define tu disponibilidad y toma los días libres que necesites." },
    { icon: "📍", title: "Trabaja Cerca de Casa", desc: "Te conectamos con trabajos en tus códigos postales para que viajes menos y ganes más." },
    { icon: "💰", title: "Quédate con las Propinas", desc: "El 100% de las propinas van directo a ti. Buen servicio significa ingresos extra." },
    { icon: "📋", title: "Estándares Claros", desc: "Recibes nuestra lista de tareas por habitación, así siempre sabes exactamente qué requiere cada trabajo." },
    { icon: "📱", title: "Plataforma Sencilla", desc: "Ve las ofertas de trabajo, acepta, sigue tus ganancias y marca los trabajos completados — todo desde tu teléfono." },
  ],
  stepsEyebrow: "Proceso Sencillo",
  stepsTitle: "Cómo empezar",
  stepsSub: "De la solicitud a tu primer trabajo en tan solo 3–5 días hábiles.",
  steps: [
    { num: "1", title: "Aplica en Línea", desc: "Completa la solicitud corta aquí abajo. Toma unos 5 minutos." },
    { num: "2", title: "Entrevista Rápida", desc: "Una llamada corta por teléfono o video para conocerte y responder tus preguntas." },
    { num: "3", title: "Verificación de Identidad", desc: "Verificamos tu identificación oficial durante la llamada. Sin costo para ti." },
    { num: "4", title: "Empieza a Ganar", desc: "Te aprobamos y empiezas a recibir ofertas de trabajo en tu área de inmediato." },
  ],
  formEyebrow: "Solicitud",
  formTitle: "Aplica para unirte al equipo",
  formCardTitle: "Solicitud de Limpiador",
  formCardSub: "Todos los campos marcados con * son obligatorios. Toma unos 5 minutos.",
  secPersonal: "Información Personal",
  secExperience: "Experiencia",
  secAvailability: "Disponibilidad",
  secLogistics: "Logística",
  secConsent: "Consentimiento y Acuerdo",
  firstName: "Nombre",
  lastName: "Apellido",
  emailLabel: "Correo Electrónico",
  phoneLabel: "Número de Teléfono",
  zipLabel: "Código Postal de tu Casa",
  experienceLabel: "Años de experiencia en limpieza",
  bioLabel: "Cuéntanos sobre ti",
  bioPlaceholder: "¿Por qué quieres unirte a BubbleBox? ¿Tienes experiencia o habilidades relevantes?",
  servicesLabel: "Tipos de servicio con los que te sientes cómodo",
  daysLabel: "Días disponibles",
  hoursLabel: "Horario preferido",
  transportLabel: "¿Tienes transporte confiable?",
  suppliesLabel: "¿Tienes tus propios productos de limpieza?",
  yes: "Sí",
  no: "No",
  workAuthTitle: "Autorización de trabajo",
  workAuthText:
    "Estoy legalmente autorizado para trabajar como contratista independiente en los Estados Unidos. Entiendo que se requiere un formulario W-9 con un SSN o ITIN válido antes de mi primer pago.",
  idConsentTitle: "Consentimiento de verificación de identidad",
  idConsentText:
    "Acepto verificar mi identificación oficial durante mi llamada de entrevista, como se requiere para cualquier persona que entre a las casas de los clientes.",
  termsTitle: "Acuerdo de términos",
  termsText: "He leído y acepto los",
  termsLink: "Términos de Servicio",
  privacyLink: "Política de Privacidad",
  submit: "Enviar Solicitud →",
  submitting: "Enviando…",
  errName: "Por favor escribe tu nombre completo.",
  errEmail: "Por favor escribe un correo electrónico válido.",
  errPhone: "Por favor escribe un número de teléfono válido de EE.UU.",
  errZip: "Por favor escribe tu código postal de 5 dígitos.",
  errServices: "Por favor selecciona al menos un tipo de servicio.",
  errDays: "Por favor selecciona al menos un día disponible.",
  errTransport: "Por favor indícanos sobre tu transporte.",
  errConsent: "Por favor marca todas las casillas para continuar.",
  errWorkAuth: "Debes confirmar que estás autorizado para trabajar como contratista independiente.",
  errNetwork: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  successTitle: "¡Solicitud enviada!",
  successBody:
    "¡Gracias por aplicar a BubbleBox ATL! Revisaremos tu solicitud y te contactaremos en 2–3 días hábiles.",
  successSteps: [
    "Revisaremos tu solicitud",
    "Te enviaremos un enlace por correo para agendar tu entrevista",
    "Verificaremos tu identificación en la llamada",
    "¡Te aprobamos y empiezas a ganar!",
  ],
  backHome: "Volver al Inicio",
  services: {
    "standard-cleaning": "🧹 Limpieza Estándar",
    "deep-cleaning": "✨ Limpieza Profunda",
    "airbnb-turnover": "🏠 Limpieza de Airbnb",
    "move-in-out": "📦 Mudanza (Entrada/Salida)",
    "post-construction": "🏗️ Post-Construcción",
    "office-cleaning": "🏢 Oficina/Comercial",
  },
  days: { Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb", Sun: "Dom" },
  hours: {
    morning: "☀️ Mañana (8am–12pm)",
    afternoon: "🌤️ Tarde (12pm–5pm)",
    evening: "🌙 Noche (5pm–8pm)",
    flexible: "🔄 Flexible / Cualquier hora",
  },
  experience: [
    { value: "", label: "Selecciona tu nivel de experiencia" },
    { value: "none", label: "Sin experiencia — dispuesto a aprender" },
    { value: "<1", label: "Menos de 1 año" },
    { value: "1-2", label: "1–2 años" },
    { value: "3-5", label: "3–5 años" },
    { value: "5+", label: "5+ años" },
  ],
};

const pt: JoinCopy = {
  hiringBadge: "Contratando em Atlanta",
  heroTitle1: "Ganhe dinheiro limpando.",
  heroTitle2: "No seu próprio horário.",
  heroSub:
    "Junte-se à equipe da BubbleBox ATL e construa uma carreira flexível em limpeza. Pagamento semanal, bons clientes e trabalho perto de casa.",
  perksEyebrow: "Por que a BubbleBox",
  perksTitle: "Um trabalho de limpeza que funciona para você",
  perks: [
    { icon: "💵", title: "Pagamento Semanal", desc: "Pagamos toda sexta-feira pelo trabalho da semana. Você fica com 80% do que o cliente paga — uma limpeza pesada de $169 paga $135.20 para você." },
    { icon: "🗓️", title: "Horário Flexível", desc: "Você escolhe quando trabalhar. Defina sua disponibilidade e tire os dias de folga que precisar." },
    { icon: "📍", title: "Trabalhe Perto de Casa", desc: "Conectamos você a trabalhos nos seus CEPs para reduzir o deslocamento e aumentar seus ganhos." },
    { icon: "💰", title: "Fique com as Gorjetas", desc: "100% das gorjetas vão direto para você. Bom serviço significa renda extra." },
    { icon: "📋", title: "Padrões Claros", desc: "Você recebe nossa lista de tarefas por cômodo, então sempre sabe exatamente o que cada trabalho exige." },
    { icon: "📱", title: "Plataforma Simples", desc: "Veja ofertas de trabalho, aceite, acompanhe seus ganhos e marque trabalhos concluídos — tudo pelo celular." },
  ],
  stepsEyebrow: "Processo Simples",
  stepsTitle: "Como começar",
  stepsSub: "Da inscrição ao primeiro trabalho em apenas 3–5 dias úteis.",
  steps: [
    { num: "1", title: "Inscreva-se Online", desc: "Preencha o formulário curto abaixo. Leva cerca de 5 minutos." },
    { num: "2", title: "Entrevista Rápida", desc: "Uma ligação curta por telefone ou vídeo para conhecer você e responder suas perguntas." },
    { num: "3", title: "Verificação de Identidade", desc: "Verificamos seu documento oficial durante a ligação. Sem custo para você." },
    { num: "4", title: "Comece a Ganhar", desc: "Você é aprovado e começa a receber ofertas de trabalho na sua área imediatamente." },
  ],
  formEyebrow: "Inscrição",
  formTitle: "Inscreva-se para entrar na equipe",
  formCardTitle: "Formulário do Faxineiro",
  formCardSub: "Todos os campos marcados com * são obrigatórios. Leva cerca de 5 minutos.",
  secPersonal: "Informações Pessoais",
  secExperience: "Experiência",
  secAvailability: "Disponibilidade",
  secLogistics: "Logística",
  secConsent: "Consentimento e Acordo",
  firstName: "Nome",
  lastName: "Sobrenome",
  emailLabel: "E-mail",
  phoneLabel: "Telefone",
  zipLabel: "CEP da sua Casa",
  experienceLabel: "Anos de experiência em limpeza",
  bioLabel: "Conte-nos sobre você",
  bioPlaceholder: "Por que você quer entrar na BubbleBox? Tem experiência ou habilidades relevantes?",
  servicesLabel: "Tipos de serviço com os quais você se sente confortável",
  daysLabel: "Dias disponíveis",
  hoursLabel: "Horário preferido",
  transportLabel: "Tem transporte confiável?",
  suppliesLabel: "Você tem seus próprios produtos de limpeza?",
  yes: "Sim",
  no: "Não",
  workAuthTitle: "Autorização de trabalho",
  workAuthText:
    "Estou legalmente autorizado a trabalhar como contratante independente nos Estados Unidos. Entendo que um formulário W-9 com SSN ou ITIN válido é necessário antes do meu primeiro pagamento.",
  idConsentTitle: "Consentimento de verificação de identidade",
  idConsentText:
    "Concordo em verificar meu documento oficial durante a ligação de entrevista, como exigido para qualquer pessoa que entre na casa dos clientes.",
  termsTitle: "Acordo de termos",
  termsText: "Li e concordo com os",
  termsLink: "Termos de Serviço",
  privacyLink: "Política de Privacidade",
  submit: "Enviar Inscrição →",
  submitting: "Enviando…",
  errName: "Por favor, escreva seu nome completo.",
  errEmail: "Por favor, escreva um e-mail válido.",
  errPhone: "Por favor, escreva um telefone válido dos EUA.",
  errZip: "Por favor, escreva seu CEP de 5 dígitos.",
  errServices: "Por favor, selecione pelo menos um tipo de serviço.",
  errDays: "Por favor, selecione pelo menos um dia disponível.",
  errTransport: "Por favor, informe sobre seu transporte.",
  errConsent: "Por favor, marque todas as caixas para continuar.",
  errWorkAuth: "Você precisa confirmar que está autorizado a trabalhar como contratante independente.",
  errNetwork: "Não conseguimos conectar ao servidor. Verifique sua conexão e tente novamente.",
  successTitle: "Inscrição enviada!",
  successBody:
    "Obrigado por se inscrever na BubbleBox ATL! Vamos analisar sua inscrição e entrar em contato em 2–3 dias úteis.",
  successSteps: [
    "Vamos analisar sua inscrição",
    "Enviaremos um link por e-mail para agendar sua entrevista",
    "Verificaremos seu documento na ligação",
    "Seja aprovado e comece a ganhar!",
  ],
  backHome: "Voltar ao Início",
  services: {
    "standard-cleaning": "🧹 Limpeza Padrão",
    "deep-cleaning": "✨ Limpeza Pesada",
    "airbnb-turnover": "🏠 Limpeza de Airbnb",
    "move-in-out": "📦 Mudança (Entrada/Saída)",
    "post-construction": "🏗️ Pós-Obra",
    "office-cleaning": "🏢 Escritório/Comercial",
  },
  days: { Mon: "Seg", Tue: "Ter", Wed: "Qua", Thu: "Qui", Fri: "Sex", Sat: "Sáb", Sun: "Dom" },
  hours: {
    morning: "☀️ Manhã (8h–12h)",
    afternoon: "🌤️ Tarde (12h–17h)",
    evening: "🌙 Noite (17h–20h)",
    flexible: "🔄 Flexível / Qualquer horário",
  },
  experience: [
    { value: "", label: "Selecione seu nível de experiência" },
    { value: "none", label: "Sem experiência — disposto a aprender" },
    { value: "<1", label: "Menos de 1 ano" },
    { value: "1-2", label: "1–2 anos" },
    { value: "3-5", label: "3–5 anos" },
    { value: "5+", label: "5+ anos" },
  ],
};

export const JOIN_COPY: Record<Lang, JoinCopy> = { en, es, pt };
