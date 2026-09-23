"use client";

// Cleaner onboarding guide, served from our own domain at /guide so the link
// we text applicants is bubbleboxatl.com. Three languages, switched in place.
import { useState } from "react";
import { Header, Footer } from "@/components/Chrome";

type Lang = "en" | "es" | "pt";

type Copy = {
  eyebrow: string;
  h1: string;
  lede: string;
  pct_text: string;
  tabs_h: string;
  tabs_note: string;
  t1: string;
  t1d: string;
  t2: string;
  t2d: string;
  t3: string;
  t3d: string;
  t4: string;
  t4d: string;
  prof_h: string;
  prof_note: string;
  p1: string;
  p1d: string;
  p2: string;
  p2d: string;
  p3: string;
  p3d: string;
  p4: string;
  p4d: string;
  p5: string;
  p5d: string;
  b_save: string;
  offer_h: string;
  offer_note: string;
  svc: string;
  r_date: string;
  v_date: string;
  r_arrive: string;
  v_arrive: string;
  r_size: string;
  v_size: string;
  r_sup: string;
  v_sup: string;
  cap: string;
  b_decline: string;
  b_accept: string;
  offer_after: string;
  day_h: string;
  day_note: string;
  s1: string;
  s1d: string;
  s2: string;
  s2d: string;
  s2n: string;
  b_nav: string;
  b_way: string;
  s3: string;
  s3d: string;
  b_arr: string;
  s3n: string;
  s4: string;
  s4d: string;
  b_start: string;
  n_before: string;
  n_after: string;
  s5: string;
  s5d: string;
  s6: string;
  s6d: string;
  b_done: string;
  rules_h: string;
  f1: string;
  f1d: string;
  f2: string;
  f2d: string;
  f3: string;
  f3d: string;
  f4: string;
  f4d: string;
  f5: string;
  f5d: string;
  call_h: string;
  call_d: string;
  close_h: string;
  close_d: string;
};

const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "pt", label: "Português", flag: "🇧🇷" },
];

const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: "BubbleBox ATL · Cleaner guide",
    h1: "Your first clean, start to finish.",
    lede: "Everything the app asks of you, in the order it asks. Five minutes now saves a confused morning later.",
    pct_text: "of what the customer pays goes to you. Every job shows <strong>your take-home</strong>, never the customer’s price — the number on the card is the number you earn.",
    tabs_h: "Four tabs, that’s the whole app",
    tabs_note: "Across the top of your dashboard.",
    t1: "Offers",
    t1d: "Open jobs. A badge pulses when something new lands.",
    t2: "Jobs",
    t2d: "Work you’ve accepted. This is where you run the day.",
    t3: "Earnings",
    t3d: "This week, this month, pending, lifetime.",
    t4: "Profile",
    t4d: "Your details and how you get paid.",
    prof_h: "Set your profile up first",
    prof_note: "Before your first job. The Profile tab, then Save at the bottom — nothing sticks until you tap it.",
    p1: "Photo",
    p1d: "Tap “Add a profile photo.” Customers see your face when you’re assigned to them, and a clear, friendly photo does more for you than anything else on this page. Under 5 MB.",
    p2: "Phone",
    p2d: "Already filled in from your application. Fix it if it’s wrong — this is how we reach you about a job.",
    p3: "Service ZIP codes",
    p3d: "Five digits each, separated by commas: 30311, 30318, 30310. At least one, and put the areas you’ll really drive to.",
    p4: "About you",
    p4d: "A sentence or two, up to 400 characters. Customers read this. Say how long you’ve been cleaning and what you’re good at — specific beats polished.",
    p5: "What you can’t change here",
    p5d: "Your name and your services are fixed on this screen. Email us and we’ll update them.",
    b_save: "Save profile",
    offer_h: "An offer looks like this",
    offer_note: "Every cleared cleaner sees the same job at the same time. First to accept gets it — so if you want it, take it.",
    svc: "Deep Cleaning",
    r_date: "Date",
    v_date: "Sat, Sep 27",
    r_arrive: "Arrive between",
    v_arrive: "10:00 – 10:30 AM",
    r_size: "Size",
    v_size: "3 bed · 2 bath",
    r_sup: "Supplies",
    v_sup: "You bring supplies",
    cap: "your payout",
    b_decline: "Decline",
    b_accept: "Accept job",
    offer_after: "Check the <strong>supplies</strong> line before you accept. Some customers provide everything; most don’t.",
    day_h: "The day of the job",
    day_note: "Six taps, in this order. Each one tells the customer something, which is why the order matters.",
    s1: "Accept",
    s1d: "The job moves out of Offers and into your <strong>Jobs</strong> tab. Nobody else can take it now.",
    s2: "Head over",
    s2d: "Tap <strong>Navigate</strong> and your maps app opens with the address loaded. That same tap tells the customer you’re on the way — you don’t need to do both.",
    s2n: "Use “On my way” on its own if you already know the route.",
    b_nav: "🧭 Navigate",
    b_way: "🚗 On my way",
    s3: "Tap arrived at the door",
    s3d: "Do this when you’re actually there. The customer’s tracker moves to <strong>“At your door”</strong> so they know to let you in.",
    b_arr: "🚪 I’ve arrived",
    s3n: "It turns grey and reads “✓ Customer notified” once it’s through.",
    s4: "Start the job",
    s4d: "This button stays greyed out until you’ve tapped arrived. That’s on purpose — the customer should never find you already working without knowing you came in.",
    b_start: "▶ Start job",
    n_before: "before arriving",
    n_after: "after",
    s5: "Clean",
    s5d: "Questions for the customer go through the app’s messages, not your own phone. Their number is never shown, and yours isn’t shown to them.",
    s6: "Complete",
    s6d: "Tap this before you leave. It closes the job and starts the clock on your payout.",
    b_done: "✓ Complete job",
    rules_h: "The rules worth knowing",
    f1: "Arrival window",
    f1d: "The hour the customer picked, plus 30 minutes. A 10:00 booking means you’re expected between 10:00 and 10:30.",
    f2: "Running late",
    f2d: "More than 15 minutes past the end of that window and the customer can cancel without paying. Message them early — most people are fine about it if they hear from you.",
    f3: "Can’t make it",
    f3d: "Release the job from the Jobs tab. It asks why, and the answer is required. Inside 24 hours it counts as a strike, so release early if you know.",
    f4: "Getting paid",
    f4d: "The pay week runs Wednesday to Tuesday, and it’s paid that Friday. Earnings shows what’s pending before it lands.",
    f5: "Supplies",
    f5d: "Bring your own unless the offer says the customer provides them.",
    call_h: "If a house is worse than it was booked as",
    call_d: "Don’t negotiate with the customer, and never ask them for more money at the door. Message the office and we’ll sort the price out. You’ll be paid for the job you actually did — that’s ours to fix, not yours.",
    close_h: "Stuck on something?",
    close_d: "<strong>Message us.</strong> There’s no wrong question in your first couple of weeks, and it’s much better to ask from the driveway than to guess.",
  },
  es: {
    eyebrow: "BubbleBox ATL · Guía para limpiadoras",
    h1: "Tu primera limpieza, de principio a fin.",
    lede: "Todo lo que la app te pide, en el orden en que te lo pide. Cinco minutos ahora te ahorran una mañana confusa después.",
    pct_text: "de lo que paga el cliente es para ti. Cada trabajo muestra <strong>lo que tú te llevas</strong>, nunca el precio del cliente — el número en la tarjeta es lo que ganas.",
    tabs_h: "Cuatro pestañas, eso es toda la app",
    tabs_note: "En la parte de arriba de tu panel.",
    t1: "Ofertas",
    t1d: "Trabajos disponibles. Un aviso parpadea cuando llega algo nuevo.",
    t2: "Trabajos",
    t2d: "Lo que ya aceptaste. Aquí manejas tu día.",
    t3: "Ganancias",
    t3d: "Esta semana, este mes, pendiente, total.",
    t4: "Perfil",
    t4d: "Tus datos y cómo te pagamos.",
    prof_h: "Primero arma tu perfil",
    prof_note: "Antes de tu primer trabajo. La pestaña Perfil, y luego Guardar abajo — nada se guarda hasta que lo toques.",
    p1: "Foto",
    p1d: "Toca “Agregar foto de perfil”. El cliente ve tu cara cuando te asignan, y una foto clara y amable te sirve más que cualquier otra cosa de esta pantalla. Menos de 5 MB.",
    p2: "Teléfono",
    p2d: "Ya viene de tu solicitud. Corrígelo si está mal — así te contactamos por un trabajo.",
    p3: "Códigos postales",
    p3d: "Cinco dígitos cada uno, separados por comas: 30311, 30318, 30310. Al menos uno, y pon las zonas a las que de verdad manejarías.",
    p4: "Sobre ti",
    p4d: "Una o dos frases, hasta 400 caracteres. Los clientes lo leen. Di cuánto tiempo llevas limpiando y en qué eres buena — lo específico gana.",
    p5: "Lo que no cambias aquí",
    p5d: "Tu nombre y tus servicios están fijos en esta pantalla. Escríbenos y los actualizamos.",
    b_save: "Guardar perfil",
    offer_h: "Así se ve una oferta",
    offer_note: "Todas las limpiadoras aprobadas ven el mismo trabajo al mismo tiempo. La primera que acepta se lo queda — si lo quieres, tómalo.",
    svc: "Limpieza Profunda",
    r_date: "Fecha",
    v_date: "Sáb, 27 sep",
    r_arrive: "Llegar entre",
    v_arrive: "10:00 – 10:30 AM",
    r_size: "Tamaño",
    v_size: "3 rec · 2 baños",
    r_sup: "Materiales",
    v_sup: "Tú los traes",
    cap: "tu pago",
    b_decline: "Rechazar",
    b_accept: "Aceptar trabajo",
    offer_after: "Revisa la línea de <strong>materiales</strong> antes de aceptar. Algunos clientes los ponen; la mayoría no.",
    day_h: "El día del trabajo",
    day_note: "Seis toques, en este orden. Cada uno le avisa algo al cliente, por eso el orden importa.",
    s1: "Acepta",
    s1d: "El trabajo sale de Ofertas y entra a tu pestaña <strong>Trabajos</strong>. Ya nadie más puede tomarlo.",
    s2: "Sal para allá",
    s2d: "Toca <strong>Navegar</strong> y tu app de mapas abre con la dirección lista. Ese mismo toque le avisa al cliente que vas en camino — no tienes que hacer las dos cosas.",
    s2n: "Usa “Voy en camino” solo si ya te sabes la ruta.",
    b_nav: "🧭 Navegar",
    b_way: "🚗 Voy en camino",
    s3: "Toca que llegaste, en la puerta",
    s3d: "Hazlo cuando de verdad ya estés ahí. El seguimiento del cliente cambia a <strong>“En tu puerta”</strong> para que sepa abrirte.",
    b_arr: "🚪 Ya llegué",
    s3n: "Se pone gris y dice “✓ Cliente notificado” cuando entra.",
    s4: "Empieza el trabajo",
    s4d: "Este botón queda gris hasta que toques que llegaste. Es a propósito — el cliente nunca debe encontrarte ya trabajando sin saber que entraste.",
    b_start: "▶ Empezar",
    n_before: "antes de llegar",
    n_after: "después",
    s5: "Limpia",
    s5d: "Las preguntas al cliente van por los mensajes de la app, no por tu teléfono. Su número nunca se muestra, y el tuyo tampoco se le muestra a él.",
    s6: "Termina",
    s6d: "Tócalo antes de irte. Cierra el trabajo y arranca el reloj de tu pago.",
    b_done: "✓ Terminar trabajo",
    rules_h: "Las reglas que sí importan",
    f1: "Ventana de llegada",
    f1d: "La hora que eligió el cliente, más 30 minutos. Una cita de 10:00 significa que te esperan entre 10:00 y 10:30.",
    f2: "Si vas tarde",
    f2d: "Más de 15 minutos después de que cierra esa ventana y el cliente puede cancelar sin pagar. Avísale temprano — casi todos lo entienden si saben de ti.",
    f3: "Si no puedes ir",
    f3d: "Libera el trabajo desde la pestaña Trabajos. Te pregunta por qué, y la respuesta es obligatoria. Dentro de 24 horas cuenta como falta, así que libéralo temprano si ya sabes.",
    f4: "Cómo te pagamos",
    f4d: "La semana de pago va de miércoles a martes, y se paga ese viernes. Ganancias te muestra lo pendiente antes de que caiga.",
    f5: "Materiales",
    f5d: "Trae los tuyos, a menos que la oferta diga que el cliente los pone.",
    call_h: "Si la casa está peor de lo que se reservó",
    call_d: "No negocies con el cliente, y nunca le pidas más dinero en la puerta. Mandános un mensaje y nosotros arreglamos el precio. Te pagamos por el trabajo que de verdad hiciste — eso nos toca a nosotros, no a ti.",
    close_h: "¿Te atoraste en algo?",
    close_d: "<strong>Escríbenos.</strong> No hay preguntas tontas en tus primeras semanas, y es mucho mejor preguntar desde la entrada que adivinar.",
  },
  pt: {
    eyebrow: "BubbleBox ATL · Guia da faxineira",
    h1: "Sua primeira faxina, do início ao fim.",
    lede: "Tudo o que o app pede, na ordem em que ele pede. Cinco minutos agora evitam uma manhã confusa depois.",
    pct_text: "do que o cliente paga vai para você. Cada trabalho mostra <strong>o que você recebe</strong>, nunca o preço do cliente — o número no card é o que você ganha.",
    tabs_h: "Quatro abas, esse é o app inteiro",
    tabs_note: "No topo do seu painel.",
    t1: "Ofertas",
    t1d: "Trabalhos disponíveis. Um aviso pisca quando chega algo novo.",
    t2: "Trabalhos",
    t2d: "O que você aceitou. É aqui que você toca o dia.",
    t3: "Ganhos",
    t3d: "Esta semana, este mês, pendente, total.",
    t4: "Perfil",
    t4d: "Seus dados e como você recebe.",
    prof_h: "Monte seu perfil primeiro",
    prof_note: "Antes do primeiro trabalho. A aba Perfil, e depois Salvar embaixo — nada é salvo até você tocar.",
    p1: "Foto",
    p1d: "Toque em “Adicionar foto de perfil”. O cliente vê seu rosto quando você é escalada, e uma foto clara e simpática ajuda mais que qualquer outra coisa desta tela. Menos de 5 MB.",
    p2: "Telefone",
    p2d: "Já vem da sua inscrição. Corrija se estiver errado — é assim que falamos com você sobre um trabalho.",
    p3: "CEPs de atendimento",
    p3d: "Cinco dígitos cada, separados por vírgula: 30311, 30318, 30310. Pelo menos um, e coloque as regiões onde você realmente iria.",
    p4: "Sobre você",
    p4d: "Uma ou duas frases, até 400 caracteres. Os clientes leem isso. Diga há quanto tempo você faz faxina e no que é boa — específico vence.",
    p5: "O que não dá para mudar aqui",
    p5d: "Seu nome e seus serviços são fixos nesta tela. Nos escreva que atualizamos.",
    b_save: "Salvar perfil",
    offer_h: "Uma oferta é assim",
    offer_note: "Todas as faxineiras aprovadas veem o mesmo trabalho ao mesmo tempo. A primeira que aceitar fica com ele — se você quer, pegue.",
    svc: "Limpeza Pesada",
    r_date: "Data",
    v_date: "Sáb, 27 set",
    r_arrive: "Chegar entre",
    v_arrive: "10:00 – 10:30",
    r_size: "Tamanho",
    v_size: "3 quartos · 2 banheiros",
    r_sup: "Materiais",
    v_sup: "Você leva",
    cap: "seu pagamento",
    b_decline: "Recusar",
    b_accept: "Aceitar trabalho",
    offer_after: "Confira a linha de <strong>materiais</strong> antes de aceitar. Alguns clientes fornecem; a maioria não.",
    day_h: "O dia do trabalho",
    day_note: "Seis toques, nesta ordem. Cada um avisa algo ao cliente — por isso a ordem importa.",
    s1: "Aceite",
    s1d: "O trabalho sai de Ofertas e vai para a sua aba <strong>Trabalhos</strong>. Ninguém mais pode pegar.",
    s2: "Vá até lá",
    s2d: "Toque em <strong>Navegar</strong> e seu app de mapas abre com o endereço pronto. Esse mesmo toque avisa o cliente que você está a caminho — não precisa fazer os dois.",
    s2n: "Use “Estou a caminho” sozinho se você já sabe o caminho.",
    b_nav: "🧭 Navegar",
    b_way: "🚗 Estou a caminho",
    s3: "Toque que chegou, na porta",
    s3d: "Faça isso quando estiver mesmo lá. O acompanhamento do cliente muda para <strong>“Na sua porta”</strong> para ele saber que é hora de abrir.",
    b_arr: "🚪 Cheguei",
    s3n: "Fica cinza e escreve “✓ Cliente avisado” quando registra.",
    s4: "Comece o trabalho",
    s4d: "Este botão fica cinza até você tocar que chegou. É de propósito — o cliente nunca deve te encontrar já trabalhando sem saber que você entrou.",
    b_start: "▶ Começar",
    n_before: "antes de chegar",
    n_after: "depois",
    s5: "Limpe",
    s5d: "Dúvidas para o cliente vão pelas mensagens do app, não pelo seu telefone. O número dele nunca aparece, e o seu não aparece para ele.",
    s6: "Conclua",
    s6d: "Toque antes de ir embora. Isso fecha o trabalho e começa a contar o seu pagamento.",
    b_done: "✓ Concluir trabalho",
    rules_h: "As regras que valem saber",
    f1: "Janela de chegada",
    f1d: "A hora que o cliente escolheu, mais 30 minutos. Um agendamento das 10:00 significa que esperam você entre 10:00 e 10:30.",
    f2: "Se atrasar",
    f2d: "Mais de 15 minutos depois do fim dessa janela e o cliente pode cancelar sem pagar. Avise cedo — quase todo mundo entende se souber de você.",
    f3: "Se não puder ir",
    f3d: "Libere o trabalho pela aba Trabalhos. Ele pergunta o motivo, e a resposta é obrigatória. Dentro de 24 horas conta como falta, então libere cedo se já souber.",
    f4: "Como você recebe",
    f4d: "A semana de pagamento vai de quarta a terça, e cai naquela sexta. Ganhos mostra o que está pendente antes de cair.",
    f5: "Materiais",
    f5d: "Leve os seus, a menos que a oferta diga que o cliente fornece.",
    call_h: "Se a casa estiver pior do que foi reservada",
    call_d: "Não negocie com o cliente, e nunca peça mais dinheiro na porta. Nos mande uma mensagem e nós ajustamos o preço. Você recebe pelo trabalho que realmente fez — isso é problema nosso, não seu.",
    close_h: "Travou em alguma coisa?",
    close_d: "<strong>Fale com a gente.</strong> Não existe pergunta boba nas suas primeiras semanas, e é muito melhor perguntar da garagem do que adivinhar.",
  },
};

// Some copy carries inline <strong>, so it is rendered as HTML. The strings are
// our own constants above - nothing here comes from user input.
function Html({ className, html }: { className?: string; html: string }) {
  return <p className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function GuidePage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];

  return (
    <>
      <Header />
      <main className="bbguide">
        <div className="wrap">
          <nav className="langbar" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`langbtn ${lang === l.id ? "on" : ""}`}
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
              >
                <span className="fl">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </nav>

          <header>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.h1}</h1>
            <p className="lede">{t.lede}</p>
          </header>

          <hr className="rule" />

          <div className="headline-fact">
            <span className="pct">80%</span>
            <Html className="pct-text" html={t.pct_text} />
          </div>

          <hr className="rule" />

          <div className="block">
            <div className="sec-head">
              <h2>{t.tabs_h}</h2>
              <p className="sec-note">{t.tabs_note}</p>
            </div>
            <div className="tabs">
              <div className="tabcard"><span className="tabname">{t.t1}</span><p>{t.t1d}</p></div>
              <div className="tabcard"><span className="tabname">{t.t2}</span><p>{t.t2d}</p></div>
              <div className="tabcard"><span className="tabname">{t.t3}</span><p>{t.t3d}</p></div>
              <div className="tabcard"><span className="tabname">{t.t4}</span><p>{t.t4d}</p></div>
            </div>
          </div>

          <hr className="rule" />

          <div className="block">
            <div className="sec-head">
              <h2>{t.prof_h}</h2>
              <p className="sec-note">{t.prof_note}</p>
            </div>
            <dl className="facts">
              <div className="fact"><dt>{t.p1}</dt><dd>{t.p1d}</dd></div>
              <div className="fact"><dt>{t.p2}</dt><dd>{t.p2d}</dd></div>
              <div className="fact"><dt>{t.p3}</dt><dd>{t.p3d}</dd></div>
              <div className="fact"><dt>{t.p4}</dt><dd>{t.p4d}</dd></div>
              <div className="fact"><dt>{t.p5}</dt><dd>{t.p5d}</dd></div>
            </dl>
            <span className="btn">{t.b_save}</span>
          </div>

          <hr className="rule" />

          <div className="block">
            <div className="sec-head">
              <h2>{t.offer_h}</h2>
              <p className="sec-note">{t.offer_note}</p>
            </div>
            <div className="offer">
              <div className="offer-top">
                <div>
                  <div className="offer-svc">{t.svc}</div>
                  <div className="offer-zip">ZIP 30135</div>
                </div>
                <div className="offer-pay">
                  <div className="amt">$135.20</div>
                  <div className="cap">{t.cap}</div>
                </div>
              </div>
              <dl className="rows">
                <dt>{t.r_date}</dt><dd>{t.v_date}</dd>
                <dt>{t.r_arrive}</dt><dd><em>{t.v_arrive}</em></dd>
                <dt>{t.r_size}</dt><dd>{t.v_size}</dd>
                <dt>{t.r_sup}</dt><dd>{t.v_sup}</dd>
              </dl>
              <div className="btnrow">
                <span className="btn ghost">{t.b_decline}</span>
                <span className="btn">{t.b_accept}</span>
              </div>
            </div>
            <Html className="sec-note" html={t.offer_after} />
          </div>

          <hr className="rule" />

          <div className="block">
            <div className="sec-head">
              <h2>{t.day_h}</h2>
              <p className="sec-note">{t.day_note}</p>
            </div>
            <ol className="flow">
              <li data-n="1"><div className="step-body">
                <h3>{t.s1}</h3><Html html={t.s1d} />
              </div></li>
              <li data-n="2"><div className="step-body">
                <h3>{t.s2}</h3><Html html={t.s2d} />
                <div className="btnrow"><span className="btn">{t.b_nav}</span><span className="btn">{t.b_way}</span></div>
                <p className="btn-note">{t.s2n}</p>
              </div></li>
              <li data-n="3"><div className="step-body">
                <h3>{t.s3}</h3><Html html={t.s3d} />
                <span className="btn amber">{t.b_arr}</span>
                <p className="btn-note">{t.s3n}</p>
              </div></li>
              <li data-n="4"><div className="step-body">
                <h3>{t.s4}</h3><Html html={t.s4d} />
                <div className="btnrow"><span className="btn dim">{t.b_start}</span><span className="btn-note">{t.n_before}</span></div>
                <div className="btnrow"><span className="btn">{t.b_start}</span><span className="btn-note">{t.n_after}</span></div>
              </div></li>
              <li data-n="5"><div className="step-body">
                <h3>{t.s5}</h3><Html html={t.s5d} />
              </div></li>
              <li data-n="6"><div className="step-body">
                <h3>{t.s6}</h3><Html html={t.s6d} />
                <span className="btn green">{t.b_done}</span>
              </div></li>
            </ol>
          </div>

          <hr className="rule" />

          <div className="block">
            <div className="sec-head"><h2>{t.rules_h}</h2></div>
            <dl className="facts">
              <div className="fact"><dt>{t.f1}</dt><dd>{t.f1d}</dd></div>
              <div className="fact"><dt>{t.f2}</dt><dd>{t.f2d}</dd></div>
              <div className="fact"><dt>{t.f3}</dt><dd>{t.f3d}</dd></div>
              <div className="fact"><dt>{t.f4}</dt><dd>{t.f4d}</dd></div>
              <div className="fact"><dt>{t.f5}</dt><dd>{t.f5d}</dd></div>
            </dl>
          </div>

          <hr className="rule" />

          <div className="callout">
            <h3>{t.call_h}</h3>
            <p>{t.call_d}</p>
          </div>

          <hr className="rule" />

          <div className="closer">
            <h2>{t.close_h}</h2>
            <Html html={t.close_d} />
            <p className="contact">hello@bubbleboxatl.com</p>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
.bbguide {
  --bbg-ink:#0d1526; --bbg-ink-mid:#4a5a75; --bbg-ink-soft:#6d7c94;
  --bbg-ground:#f6f8fc; --bbg-surface:#ffffff;
  --bbg-rule:#dbe3ef; --bbg-rule-soft:#e9eef7;
  --bbg-blue:#1d7fe8; --bbg-blue-deep:#0a2fa8; --bbg-blue-wash:#e8f1fd;
  --bbg-amber:#d97706; --bbg-amber-wash:#fdf0dc;
  --bbg-green:#15803d;
  --bbg-shadow:0 1px 2px rgba(13,21,38,.06), 0 8px 24px rgba(13,21,38,.05);
  background:var(--bbg-ground); color:var(--bbg-ink);
  font-family:var(--font-sans);
  font-size:16px; line-height:1.6; padding:0 16px;
}
.bbguide .wrap{max-width:680px;margin:0 auto;padding-block:30px 64px;}
.bbguide h1,.bbguide h2{font-family:var(--font-display);text-wrap:balance;margin:0;color:var(--bbg-ink);font-weight:400;}
.bbguide h3{font-family:var(--font-sans);text-wrap:balance;margin:0;color:var(--bbg-ink);}
.bbguide h1{font-size:clamp(34px,7vw,50px);line-height:1.05;letter-spacing:-.01em;}
.bbguide h2{font-size:clamp(23px,3.8vw,29px);letter-spacing:-.005em;line-height:1.2;}
.bbguide h3{font-weight:700;font-size:16.5px;letter-spacing:-.005em;}
.bbguide p{margin:0;}
.bbguide .eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--bbg-blue-deep);margin-bottom:14px;}
.bbguide .lede{font-size:18px;color:var(--bbg-ink-mid);margin-top:16px;max-width:52ch;}
.bbguide .rule{height:1px;background:var(--bbg-rule);border:0;margin:44px 0;}
.bbguide .block{display:flex;flex-direction:column;gap:18px;}
.bbguide .langbar{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:30px;}
.bbguide .langbtn{display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-size:13.5px;font-weight:600;color:var(--bbg-ink-mid);background:var(--bbg-surface);border:1.5px solid var(--bbg-rule);border-radius:999px;padding:7px 14px;cursor:pointer;line-height:1;}
.bbguide .langbtn .fl{font-size:15px;line-height:1;}
.bbguide .langbtn.on{border-color:var(--bbg-blue);color:var(--bbg-blue-deep);background:var(--bbg-blue-wash);}
.bbguide .langbtn:focus-visible{outline:2px solid var(--bbg-blue);outline-offset:2px;}
.bbguide .sec-head{display:flex;flex-direction:column;gap:8px;}
.bbguide .sec-note{color:var(--bbg-ink-mid);font-size:15.5px;max-width:58ch;}
.bbguide .headline-fact{background:var(--bbg-surface);border:1.5px solid var(--bbg-rule);border-radius:14px;padding:24px 22px;box-shadow:var(--bbg-shadow);display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;}
.bbguide .pct{font-family:var(--font-sans);font-weight:800;font-size:clamp(44px,9vw,64px);line-height:.9;color:var(--bbg-blue);font-variant-numeric:tabular-nums;}
.bbguide .pct-text{font-size:16.5px;color:var(--bbg-ink-mid);flex:1 1 220px;min-width:0;}
.bbguide .pct-text strong{color:var(--bbg-ink);font-weight:700;}
.bbguide .tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}
.bbguide .tabcard{background:var(--bbg-surface);border:1px solid var(--bbg-rule);border-radius:11px;padding:15px 16px;display:flex;flex-direction:column;gap:5px;}
.bbguide .tabname{font-family:var(--font-sans);font-weight:700;font-size:15px;color:var(--bbg-blue-deep);}
.bbguide .tabcard p{font-size:14.5px;color:var(--bbg-ink-mid);line-height:1.5;}
.bbguide ol.flow{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0;}
.bbguide ol.flow>li{display:grid;grid-template-columns:34px 1fr;gap:0 16px;padding-bottom:26px;position:relative;}
.bbguide ol.flow>li:last-child{padding-bottom:0;}
.bbguide ol.flow>li::before{content:attr(data-n);grid-column:1;grid-row:1;width:30px;height:30px;border-radius:50%;background:var(--bbg-blue);color:#fff;font-family:var(--font-sans);font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums;}
.bbguide ol.flow>li:not(:last-child)::after{content:"";position:absolute;left:15px;top:34px;bottom:8px;width:2px;background:var(--bbg-rule);}
.bbguide .step-body{grid-column:2;display:flex;flex-direction:column;gap:9px;padding-top:3px;}
.bbguide .step-body p{font-size:15.5px;color:var(--bbg-ink-mid);}
.bbguide .step-body p strong{color:var(--bbg-ink);font-weight:600;}
.bbguide .btn{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;border-radius:999px;padding:9px 18px;font-weight:700;font-size:14.5px;color:#fff;background:var(--bbg-blue);box-shadow:0 2px 8px rgba(29,127,232,.28);}
.bbguide .btn.amber{background:var(--bbg-amber);box-shadow:0 2px 8px rgba(217,119,6,.28);}
.bbguide .btn.green{background:var(--bbg-green);box-shadow:0 2px 8px rgba(21,128,61,.26);}
.bbguide .btn.ghost{background:transparent;color:var(--bbg-ink-soft);border:1.5px solid var(--bbg-rule);box-shadow:none;}
.bbguide .btn.dim{opacity:.45;box-shadow:none;}
.bbguide .btnrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.bbguide .btn-note{font-size:13.5px;color:var(--bbg-ink-soft);font-style:italic;}
.bbguide .offer{background:var(--bbg-surface);border:1.5px solid var(--bbg-rule);border-radius:13px;padding:16px 17px;box-shadow:var(--bbg-shadow);display:flex;flex-direction:column;gap:12px;}
.bbguide .offer-top{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;}
.bbguide .offer-svc{font-family:var(--font-sans);font-weight:700;font-size:16px;}
.bbguide .offer-zip{font-size:13px;color:var(--bbg-ink-soft);margin-top:2px;}
.bbguide .offer-pay{text-align:right;}
.bbguide .offer-pay .amt{font-family:var(--font-sans);font-weight:800;font-size:27px;color:var(--bbg-green);font-variant-numeric:tabular-nums;line-height:1;}
.bbguide .offer-pay .cap{font-size:10.5px;color:var(--bbg-ink-soft);font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-top:3px;}
.bbguide dl.rows{margin:0;display:grid;grid-template-columns:auto 1fr;gap:7px 18px;font-size:14.5px;}
.bbguide dl.rows dt{color:var(--bbg-ink-soft);}
.bbguide dl.rows dd{margin:0;text-align:right;font-weight:600;}
.bbguide dl.rows dd em{font-style:normal;color:var(--bbg-blue-deep);}
.bbguide .facts{display:flex;flex-direction:column;gap:2px;margin:0;}
.bbguide .fact{display:grid;grid-template-columns:minmax(0,150px) 1fr;gap:4px 20px;padding:14px 0;border-top:1px solid var(--bbg-rule-soft);}
.bbguide .fact:first-child{border-top:0;}
.bbguide .fact dt{font-weight:700;font-size:15px;}
.bbguide .fact dd{margin:0;color:var(--bbg-ink-mid);font-size:15.5px;}
.bbguide .callout{border-left:3px solid var(--bbg-amber);background:var(--bbg-amber-wash);border-radius:0 10px 10px 0;padding:15px 18px;display:flex;flex-direction:column;gap:6px;}
.bbguide .callout h3{font-size:15.5px;}
.bbguide .callout p{font-size:15px;color:var(--bbg-ink-mid);}
.bbguide .closer{background:var(--bbg-blue-wash);border-radius:14px;padding:24px 22px;display:flex;flex-direction:column;gap:9px;}
.bbguide .closer p{font-size:15.5px;color:var(--bbg-ink-mid);}
.bbguide .closer strong{color:var(--bbg-ink);}
.bbguide .contact{font-weight:700;font-size:16px;color:var(--bbg-blue-deep);}
@media (max-width:420px){ .bbguide .fact{grid-template-columns:1fr;} }
`}</style>
    </>
  );
}
