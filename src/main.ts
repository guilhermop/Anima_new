import './style.css';
import classes from './classes.json';
import vantagens from './vantagens.json';
import habs from './habilidades.json';
import racas from './racas.json';
import elanData from './elan.json';
import magia from './magia.json';
import equip from './equip.json';
import legado from './legacy.json';
const SKS = habs as { id: string; nome: string; g: string; a: string }[];

const BONUS = [0, -30, -20, -10, -5, 0, 5, 5, 10, 10, 15, 20, 20, 25, 25, 30, 35, 35, 40, 40, 45];
const bonus = (v: number) => BONUS[Math.min(20, Math.max(1, v))];
const ATTRS: [string, string][] = [['agi', 'Agilidade'], ['con', 'Constituição'], ['des', 'Destreza'], ['for', 'Força'], ['int', 'Inteligência'], ['per', 'Percepção'], ['pod', 'Poder'], ['von', 'Vontade']];
const COMBATE: [string, string, string][] = [['atk', 'Ataque', 'des'], ['par', 'Parada', 'des'], ['esq', 'Esquiva', 'agi'], ['arm', 'Armadura', 'for']];
const SOBRE: [string, string][] = [['psi', 'Projeção Psíquica']];
const ZEON = [5, 20, 40, 55, 70, 85, 95, 110, 120, 135, 150, 160, 175, 185, 200, 215, 225, 240, 250, 265];
const zeonBase = (v: number) => ZEON[clampN(v) - 1];
const actBase = (v: number) => (v <= 4 ? 0 : v <= 7 ? 5 : v <= 11 ? 10 : v <= 14 ? 15 : v === 15 ? 20 : v <= 17 ? 25 : v <= 19 ? 30 : 35);
const clampN = (v: number) => Math.min(20, Math.max(1, v));
// [chave, nome, passo, atributo de bônus]
const MAG: [string, string, number, string][] = [['zeon', 'Zeon', 5, ''], ['act', 'ACT (Acúmulo de Zeon)', 1, ''], ['reg', 'Regeneração zeônica', 1, ''], ['via', 'Nível de Via', 1, ''], ['mag', 'Projeção Mágica', 5, 'des'], ['conv', 'Convocar', 5, 'pod'], ['dom', 'Dominar', 5, 'von'], ['ata', 'Atar', 5, 'pod'], ['des', 'Desconvocar', 5, 'von']];
const MAGK = MAG.map(m => m[0]);
const SEC: [string, string][] = [['atl', 'Atléticas'], ['soc', 'Sociais'], ['per', 'Perceptivas'], ['int', 'Intelectuais'], ['vig', 'Vigor'], ['sub', 'Subterfúgio'], ['cre', 'Criativas']];
const DEUSES: Record<string, string[]> = { Beryl: ['Azrael', 'Barakiel', 'Edamiel', 'Gabriel', 'Rafael', 'Mikael', 'Uriel'], Shajad: ['Abbadon', 'Erebus', 'Eriol', 'Meseguis', 'Jedah', 'Noah', 'Zemial'] };
const KIA = ATTRS.filter(([k]) => ['agi', 'con', 'des', 'for', 'pod', 'von'].includes(k));
const kiBase = (v: number) => (v <= 10 ? v : 10 + 2 * (v - 10));
const acuBase = (v: number) => (v <= 9 ? 1 : v <= 12 ? 2 : v <= 15 ? 3 : 4);
const TABS: [string, string][] = [['atr', 'Atributos'], ['raca', 'Raça'], ['cmb', 'Combate'], ['ki', 'Ki'], ['mag', 'Magia'], ['via', 'Vias'], ['sob', 'Psíquico'], ['vant', 'Vantagens'], ['eq', 'Equipamento'], ['sec', 'Secundárias'], ['elan', 'Elan']];

interface Vent { id: string; c: number; o?: string }
interface State { nome: string; nivel: number; classe: string; at: Record<string, number>; pts: Record<string, number>; vida: number; elan: Record<string, number>; vent: Vent[]; nat: Record<string, number>; raca: string; sexo: string; dons: string[]; vias: { id: string; n: number }[]; livres: Record<string, string>; ouro: number[]; eq: { t: string; id: string; w?: boolean }[] }
const novo = (): State => ({ nome: '', nivel: 1, classe: 'guerrero', at: Object.fromEntries(ATTRS.map(([k]) => [k, 5])), pts: {}, vida: 0, elan: {}, vent: [], nat: {}, raca: 'RAZA_HUMANO', sexo: 'h', dons: [], vias: [], livres: {}, ouro: [0, 0, 0], eq: [] });
const KEY = 'anima-forge';
let s: State = { ...novo(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
let tab = 'atr', vsub = 'v', busca = '', esub = 'a';
const open = new Set<string>();
type V = (typeof vantagens)[number];
const vById = (id: string) => vantagens.find(v => v.id === id) as V;
const pool = (v: V) => (v.grupo === 'GRUPO_DON' ? 'd' : v.grupo === 'GRUPO_PSIQUICAS' ? 'p' : v.grupo === 'GRUPO_TRASFONDO' ? 't' : 'g');
function pcs(l: Vent[]) {
  const P: Record<string, number> = { g: 3, d: 0, p: 0, t: 0 };
  for (const x of l) { const v = vById(x.id); if (v.dis) P[pool(v)] -= x.c; }
  for (const x of l) {
    const v = vById(x.id); if (v.dis) continue;
    const k = pool(v), tomar = Math.min(x.c, Math.max(0, P[k]));
    P[k] -= tomar; P.g -= x.c - tomar;
  }
  return P;
}
function motivo(v: V, c: number): string {
  const l = [...s.vent, { id: v.id, c }], tem = (id: string) => s.vent.some(x => x.id === id);
  if (v.rep === 'no' && tem(v.id)) return 'Já adquirida';
  if (v.inc.some(tem) || s.vent.some(x => vById(x.id).inc.includes(v.id))) return 'Incompatível com algo já escolhido';
  if (v.dis && s.vent.filter(x => vById(x.id).dis).length >= 3) return 'Máximo de 3 desvantagens';
  if (!v.dis && pcs(l).g < 0) return 'PC insuficientes';
  return '';
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const C = () => classes.find(c => c.id === s.classe) ?? classes[0];
const K = () => C() as unknown as Record<string, number>;
const total = () => 600 + 100 * (s.nivel - 1);
const PRECO: Record<string, () => number> = { zeon: () => K().zeon / 5, act: () => K().costeACT, reg: () => K().costeACT / 2, via: () => 1 };
const preco = (k: string) => (PRECO[k]?.() ?? (k.startsWith('HB_') ? precoSk(skById(k)) : k.startsWith('ki_') ? K().ki : k.startsWith('acu_') ? K().acum : K()[k] ?? 0));
const custo = (k: string) => preco(k) * (s.pts[k] || 0);
const gasto = (ks: string[]) => ks.reduce((a, k) => a + custo(k), 0);
const KIK = KIA.flatMap(([k]) => ['ki_' + k, 'acu_' + k]);
const CMBK = [...COMBATE.map(c => c[0]), ...KIK];
const todas = [...CMBK, ...MAGK, ...SOBRE.map(c => c[0]), ...SKS.map(h => h.id)];
const dpGasto = () => gasto(todas) + s.vida * K().vidaMult;
const dpLivre = () => total() - dpGasto();
const limCmb = () => Math.floor(K().limCombate * total());
const final = (k: string, atr: string) => (s.pts[k] || 0) + bonus(A(atr)) + ((C().inato as Record<string, number>)[k] ?? 0) * s.nivel;
const kiTotal = () => KIA.reduce((a, [k]) => a + kiBase(A(k)) + (s.pts['ki_' + k] || 0), 0);
const acuTotal = () => KIA.reduce((a, [k]) => a + acuBase(A(k)) + (s.pts['acu_' + k] || 0), 0);
const inato = (k: string) => ((C().inato as Record<string, number>)[k] ?? 0) * s.nivel;
const actFinal = () => actBase(A('pod')) + (s.pts.act || 0) + inato('act');
const finalMag = (k: string, atr: string) => {
  const p = s.pts[k] || 0;
  if (k === 'zeon') return zeonBase(A('pod')) + p + inato('zeon');
  if (k === 'act') return actFinal();
  if (k === 'reg') return actBase(A('pod')) + p + inato('reg') + actFinal();
  if (k === 'via') return p + inato('via');
  return p + bonus(A(atr)) + inato(k);
};
const A = (k: string) => {
  let v = s.at[k] + rAt(k);
  for (const x of s.vent) {
    if (x.o !== k) continue;
    const e = vById(x.id).ef;
    if (e === 'sumarUnoAUnaCaracteristica') v += 1;
    else if (e === 'restarDosAUnaCaracteristica') v -= 2;
    else if (e === 'cambiarUnaCaracteristicaPorNueve') v = 9;
  }
  return clampN(v);
};
const REST: [string, string, string][] = [['RF', 'Física', 'con'], ['RE', 'Doenças', 'con'], ['RV', 'Venenos', 'con'], ['RM', 'Mágica', 'pod'], ['RP', 'Psíquica', 'von']];
const EXC: Record<string, string[]> = { resistenciaFisicaExcepcional: ['RF', 'RE', 'RV'], resistenciaMagicaExcepcional: ['RM'], resistenciaPsiquicaExcepcional: ['RP'] };
const HALF: Record<string, string> = { saludEnfermiza: 'RE', vulnerabilidadMagia: 'RM', debilidadFisica: 'RF', vulnerabilidadVenenos: 'RV' };
const REGEN = [0, 0, 1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12];
const resist = (r: string, a: string) => {
  const v = 30 + 5 * (s.nivel - 1) + bonus(A(a)) + rRes(r) + s.vent.reduce((t, x) => t + (EXC[vById(x.id).ef]?.includes(r) ? 25 * x.c : 0), 0);
  return s.vent.some(x => HALF[vById(x.id).ef] === r) ? Math.floor(v / 2) : v;
};
const regen = () => REGEN[A('con') - 1] + rReg() + s.vent.reduce((t, x) => t + (vById(x.id).ef === 'aumentaRegeneracion' ? vById(x.id).efv : 0), 0);
const APLICA = new Set(['sumarUnoAUnaCaracteristica', 'restarDosAUnaCaracteristica', 'cambiarUnaCaracteristicaPorNueve', 'aumentaRegeneracion', ...Object.keys(EXC), ...Object.keys(HALF), 'aprendizajeInnato', 'aprendizajeInnatoCampo', 'conocedorTodasMaterias', 'habilidoso', 'aptoEnUnCampo', 'aptoEnUnaMateria', 'sinBonificadorNatural', 'bonificadorNaturalIncrementado']);
const RZ = () => racas.find(r => r.id === s.raca);
const sum = (f: (x: (typeof racas)[number]['tr'][number]) => number) => RZ()?.tr.reduce((a, x) => a + f(x), 0) ?? 0;
const rAt = (k: string) => sum(x => (x.at as unknown as Record<string, number>)[k] || 0);
const rRes = (r: string) => sum(x => (x.res as unknown as Record<string, number>)[r] || 0) + (s.raca === 'RAZA_DUKZARIST' ? ((s.sexo === 'm' ? { RF: 15, RM: 20 } : { RF: 20, RM: 15 }) as Record<string, number>)[r] || 0 : 0);
const rReg = () => sum(x => x.reg);
type EG = (typeof elanData)[number];
type ED = EG['dons'][number];
const elSpent = (g: EG) => g.dons.filter(d => s.dons.includes(d.id)).reduce((a, d) => a + d.c, 0);
const elMotivo = (g: EG, d: ED) => {
  const sync = s.elan[g.nome] || 0, falta = d.req.find(r => !s.dons.includes(r));
  if (sync < d.min) return `Requer sincronização ${d.min}`;
  if (sync - elSpent(g) < d.c) return 'Sincronização livre insuficiente';
  return falta ? 'Requer: ' + (g.dons.find(x => x.id === falta)?.nome ?? falta) : '';
};
const rmDon = (id: string) => {
  s.dons = s.dons.filter(x => x !== id);
  for (const g of elanData) for (const d of g.dons) if (d.req.includes(id) && s.dons.includes(d.id)) rmDon(d.id);
};
const NMAX = 80;
const temDon = () => s.vent.some(x => ['don', 'donIncompleto'].includes(ef(x)));
const viaPool = () => (temDon() ? finalMag('via', '') : 0);
const viaOf = (id: string) => magia.vias.find(v => v.id === id)!;
const viaCoste = (i: number) => {
  if (s.vent.some(x => ef(x) === 'magiaOpuesta')) return 1;
  const v = viaOf(s.vias[i].id);
  for (let j = 0; j < i; j++) { const o = viaOf(s.vias[j].id).opp; if (o === v.id || o === 'TODAS_VIAS') return 2; }
  return v.nome === 'Necromancy' && i > 0 ? 2 : 1;
};
const viaGasto = () => s.vias.reduce((a, v, i) => a + v.n * viaCoste(i), 0);
const limpaLivres = (id: string) => { const n = s.vias.find(v => v.id === id)?.n ?? 0; for (const k of Object.keys(s.livres)) { const [vid, slot] = k.split(':'); if (vid === id && Number(slot) > n) delete s.livres[k]; } };
type Item = { id: string; n: string; p: number[]; w: number; d: string; [k: string]: any };
const catalogo = (t: string) => (t === 'a' ? equip.armas : t === 'r' ? equip.armaduras : equip.equipos) as unknown as Item[];
const itemDe = (x: { t: string; id: string }) => catalogo(x.t).find(i => i.id === x.id)!;
const cobre = (p: number[]) => p[0] * 100 + p[1] * 10 + p[2];
const saldo = () => cobre(s.ouro) - s.eq.reduce((a, x) => a + cobre(itemDe(x).p), 0);
const fmt = (c: number) => `${c < 0 ? '-' : ''}${Math.floor(Math.abs(c) / 100)}o ${Math.floor((Math.abs(c) % 100) / 10)}p ${Math.abs(c) % 10}c`;
const TIPOS = ['Corte', 'Impacto', 'Perfuração', 'Calor', 'Eletricidade', 'Frio', 'Energia'];
const GRUPOS_EQ: Record<string, string> = { animales: 'Animais', calzado: 'Calçados', decoracion: 'Decoração', embarcaciones: 'Embarcações', orfebreria: 'Ourivesaria', raciones: 'Rações', transporte: 'Transporte', varios: 'Diversos', venenos: 'Venenos', vestimenta: 'Vestimenta', vivienda: 'Moradia' };
const infoEq = (t: string, i: Item) => (t === 'a' ? `dano ${i.dm}${i.b ? ` +${bonus(A(i.b))}` : ''}, turno ${i.v >= 0 ? '+' : ''}${i.v}, FOR ${i.fu}${i.f2 ? '/' + i.f2 : ''}, crítico ${i.k.filter(Boolean).join('/')}${i.e.length ? ', ' + i.e.join(', ') : ''}` : t === 'r' ? `${i.l}, ${i.cl}, TA ${i.ta.join('/')}, exige armadura ${i.rq}` : i.w ? `${i.w} kg` : '');
const skById = (id: string) => SKS.find(h => h.id === id)!;
const SKN: Record<string, string> = Object.fromEntries(SKS.map(h => [h.id, h.nome]));
const CATN: Record<string, string> = Object.fromEntries(SEC);
const OPC = (l: string): [string, string][] | null => (l === 'LISTA_CARACTERISTICAS' ? ATTRS : l === 'LISTA_HABILIDADES_SECUNDARIAS' ? SKS.map(h => [h.id, h.nome]) : l === 'LISTA_TIPOS_SECUNDARIAS' ? SEC : null);
const ef = (x: Vent) => vById(x.id).ef;
const semNat = () => s.vent.some(x => ef(x) === 'sinBonificadorNatural');
const extraNat = () => s.vent.some(x => ef(x) === 'bonificadorNaturalIncrementado');
const bonusVant = (h: (typeof SKS)[number]) => s.vent.reduce((t, x) => t + (ef(x) === 'aprendizajeInnato' && x.o === h.id ? 10 * x.c : ef(x) === 'aprendizajeInnatoCampo' && x.o === h.g ? (x.c === 2 ? 5 : 10) : ef(x) === 'conocedorTodasMaterias' ? 10 : ef(x) === 'habilidoso' && h.id === 'HB_TRUCOS_MANOS' ? 30 : 0), 0);
const reducao = (h: (typeof SKS)[number]) => s.vent.reduce((t, x) => t + (ef(x) === 'aptoEnUnCampo' && x.o === h.g ? 1 : ef(x) === 'aptoEnUnaMateria' && x.o === h.id ? x.c : 0), 0);
const precoSk = (h: (typeof SKS)[number]) => Math.max(1, K()[h.g] - reducao(h));
const fisico = (h: (typeof SKS)[number]) => ['agi', 'con', 'des', 'for'].includes(h.a);
const natUso = () => { let f = 0, m = 0; for (const h of SKS) { const c = s.nat[h.id] || 0; if (fisico(h)) f += c; else m += c; } return { f, m, sobra: Math.max(0, f - s.nivel) + Math.max(0, m - s.nivel) }; };
const natOk = () => natUso().sobra <= (extraNat() ? s.nivel : 0);
const skFinal = (h: (typeof SKS)[number]) => (s.pts[h.id] || 0) + bonus(A(h.a)) * (1 + (semNat() ? 0 : s.nat[h.id] || 0)) + bonusVant(h);
const pcLivres = () => pcs(s.vent).g;
const pv = () => 20 + 10 * A('con') + bonus(A('con')) + s.nivel * K().vidaNivel + s.vida * A('con');
const ini = () => 20 + bonus(A('agi')) + bonus(A('des')) + s.nivel * K().turnoNivel;

const BT = 'h-7 w-7 rounded bg-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition';
const step = (act: string, k: string, v: string | number, d = 1) =>
  `<div class="flex items-center gap-2"><button data-act="${act}" data-k="${k}" data-d="-${d}" class="${BT}">−</button><span class="w-12 text-center font-mono">${v}</span><button data-act="${act}" data-k="${k}" data-d="${d}" class="${BT}">+</button></div>`;
const row = (label: string, right: string, hint = '') =>
  `<div class="flex items-center justify-between gap-3 border-b border-slate-800/60 py-2 last:border-0"><div class="min-w-0"><div class="truncate sm:whitespace-normal">${label}</div>${hint ? `<div class="text-xs text-slate-500">${hint}</div>` : ''}</div><div class="flex shrink-0 items-center gap-3">${right}</div></div>`;
const card = (t: string, body: string) => `<section class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/20"><h2 class="mb-2 border-b-2 border-amber-500/40 pb-1 font-serif text-base font-bold uppercase tracking-widest text-amber-400">${t}</h2>${body}</section>`;
const chip = (l: string, v: string | number, bad = false, cor = 'text-amber-300') => `<div class="min-w-[4.8rem] shrink-0 snap-start rounded-lg border-b-2 border-amber-500/70 bg-slate-900 px-3 py-1 text-center ring-1 ${bad ? 'ring-red-500/70' : 'ring-slate-700'}"><div class="text-[10px] uppercase tracking-widest text-slate-500">${l}</div><div class="font-mono text-lg font-bold ${bad ? 'text-red-400' : cor}">${v}</div></div>`;

function painel(): string {
  if (tab === 'atr') return card('Atributos', ATTRS.map(([k, n]) => row(n, step('at', k, s.at[k]) + (A(k) !== s.at[k] ? `<span class="w-10 text-right font-mono text-emerald-400">${A(k)}</span>` : ''), `bônus ${bonus(A(k)) >= 0 ? '+' : ''}${bonus(A(k))}${A(k) !== s.at[k] ? ' (com vantagens)' : ''}`)).join('')) +
    card('Resistências e regeneração', REST.map(([r, n, a]) => row(n, `<span class="font-mono text-amber-300">${resist(r, a)}</span>`, `presença ${30 + 5 * (s.nivel - 1)} + bônus de ${a.toUpperCase()}${s.vent.some(x => HALF[vById(x.id).ef] === r) ? ', pela metade' : ''}`)).join('') + row('Regeneração', `<span class="font-mono text-amber-300">${regen()}</span>`, 'base de CON + vantagens'));
  if (tab === 'cmb') {
    const g = gasto(CMBK);
    return card('Habilidades de combate', COMBATE.map(([k, n, a]) => row(n, step('pt', k, s.pts[k] || 0, 5) + `<div class="w-16 text-right font-mono text-amber-300">${final(k, a)}</div>`, `${K()[k]} PD por ponto, base ${a.toUpperCase()}`)).join('') +
      `<p class="mt-3 text-sm ${g > limCmb() ? 'text-red-400' : 'text-slate-400'}">Combate: ${g}/${limCmb()} PD (limite da classe, inclui Ki)</p>`) +
      card('Vida', row('Múltiplos de vida', step('vida', '', s.vida), `${K().vidaMult} PD cada, soma CON por múltiplo`));
  }
  if (tab === 'ki') return card('Ki', KIA.map(([k, n]) => row(n,
      `<div class="flex items-center gap-4"><div class="text-center"><div class="text-[10px] text-slate-500">Ki</div>${step('pt', 'ki_' + k, kiBase(A(k)) + (s.pts['ki_' + k] || 0))}</div><div class="text-center"><div class="text-[10px] text-slate-500">Acumulação</div>${step('pt', 'acu_' + k, acuBase(A(k)) + (s.pts['acu_' + k] || 0))}</div></div>`,
      `base ${kiBase(A(k))} Ki e ${acuBase(A(k))} acum.; ${K().ki} PD por Ki, ${K().acum} PD por acum.`)).join('') +
      `<p class="mt-3 text-sm text-slate-400">Total: ${kiTotal()} Ki, ${acuTotal()} de acumulação. Entra no limite de combate.</p>`);
  if (tab === 'raca') {
    const r = RZ();
    const tr = (r?.tr ?? []).map(x => {
      const aplica = Object.keys(x.at).length || Object.keys(x.res).length || x.reg;
      const badge = aplica ? '<span class="rounded bg-emerald-900/60 px-1.5 text-[10px] text-emerald-300">na ficha</span>' : x.obs ? '<span class="rounded bg-amber-900/60 px-1.5 text-[10px] text-amber-300">manual</span>' : '';
      return `<div class="border-b border-slate-800/70 py-2"><div class="flex items-center justify-between gap-2"><span class="${x.dis ? 'text-rose-300' : ''}">${x.nome}</span>${badge}</div><div class="text-xs text-slate-500">${x.desc}</div></div>`;
    }).join('');
    return card('Raça', `<div class="flex flex-wrap items-center gap-3"><select data-f="raca" class="rounded bg-slate-900 px-2 py-2 ring-1 ring-slate-700">${racas.map(x => `<option value="${x.id}" ${x.id === s.raca ? 'selected' : ''}>${x.nome}</option>`).join('')}</select>${s.raca === 'RAZA_DUKZARIST' ? `<select data-f="sexo" class="rounded bg-slate-900 px-2 py-2 ring-1 ring-slate-700"><option value="h" ${s.sexo === 'h' ? 'selected' : ''}>Homem</option><option value="m" ${s.sexo === 'm' ? 'selected' : ''}>Mulher</option></select>` : ''}${r && r.mod ? `<span class="text-sm text-slate-400">Modificador de nível (XP): +${r.mod}</span>` : ''}</div>`) +
      (tr ? card('Características raciais', tr + '<p class="mt-2 text-xs text-slate-500">Atributos, resistências e regeneração entram na ficha. As marcadas como "manual" são narrativas ou dependem de escolhas.</p>') : '');
  }
  if (tab === 'via') {
    const pool = viaPool(), gasto = viaGasto(), livre = pool - gasto, disp = magia.vias.filter(v => !s.vias.some(x => x.id === v.id));
    const BTN = (a: string, k: string, d: number, l: string) => `<button data-act="${a}" data-k="${k}" data-d="${d}" class="rounded bg-slate-800 px-2 py-1 text-sm text-amber-300 hover:bg-amber-500 hover:text-slate-950">${l}</button>`;
    const lista = s.vias.map((x, i) => {
      const v = viaOf(x.id), key = 'via:' + v.id;
      const slots = v.livres.filter(l => l <= x.n).map(l => {
        const k = `${v.id}:${l}`, lim = (Math.floor(l / 10) + 1) * 10, atual = s.livres[k] || '';
        const ops = magia.libre.filter(c => c.l <= lim && !c.x.includes(v.nome) && (!Object.values(s.livres).includes(c.n) || c.n === atual));
        return row(`Feitiço livre (nível ${l})`, `<select data-f="livre" data-k="${k}" class="max-w-44 rounded bg-slate-800 px-1 py-1 text-sm"><option value="">-</option>${ops.map(c => `<option value="${c.n}" ${c.n === atual ? 'selected' : ''}>${c.n} (${c.l})</option>`).join('')}</select>`, `até o nível ${lim}`);
      }).join('');
      const feit = v.c.map(c => `<div class="flex justify-between py-0.5 text-sm ${c.l <= x.n ? 'text-amber-200' : 'text-slate-600'}"><span>${c.n}</span><span class="font-mono">${c.l}</span></div>`).join('');
      return `<details data-g="${key}" class="rounded-lg bg-slate-900/50 px-3" ${open.has(key) ? 'open' : ''}><summary class="flex cursor-pointer items-center justify-between py-2"><span class="text-amber-300">${v.nome}</span><span class="font-mono text-xs text-slate-400">nível ${x.n}, custo ${viaCoste(i)} por nível</span></summary><div class="flex flex-wrap items-center gap-2 pb-2">${BTN('via', v.id, -10, '−10')}${BTN('via', v.id, -2, '−2')}${BTN('via', v.id, 2, '+2')}${BTN('via', v.id, 10, '+10')}<span class="flex-1"></span>${BTN('viadel', String(i), 0, 'Remover via')}</div>${slots}<div class="mt-2 border-t border-slate-800 pt-2">${feit}</div></details>`;
    }).join('<div class="h-2"></div>');
    return card('Vias de magia', temDon() ? `<p class="text-sm ${livre < 0 ? 'text-red-400' : 'text-slate-400'}">Níveis de via: ${gasto}/${pool} (livres ${livre}). Máximo de ${NMAX} por via. Via oposta a uma já escolhida custa o dobro, e Necromancy também, se não for a primeira.</p>` : '<p class="text-sm text-amber-300">Para usar vias é preciso da vantagem "The Gift" (aba Vantagens) e de pontos em Nível de Via (aba Magia).</p>') +
      (disp.length && temDon() ? `<div class="flex gap-2"><select data-vsel class="rounded bg-slate-900 px-2 py-2 ring-1 ring-slate-700">${disp.map(v => `<option value="${v.id}">${v.nome} (oposta: ${v.oppn})</option>`).join('')}</select><button data-act="viaadd" class="rounded bg-amber-500 px-4 py-2 text-slate-950">Adicionar via</button></div>` : '') + `<div class="space-y-1">${lista}</div>`;
  }
  if (tab === 'eq') {
    const q = busca.toLowerCase(), mon = s.eq.map((x, i) => ({ x, i, it: itemDe(x) }));
    const vest = mon.filter(m => m.x.t === 'r' && m.x.w).map(m => m.it), ta = TIPOS.map((_, k) => vest.reduce((a, v) => a + (v.ta[k] || 0), 0));
    const armaEf = final('arm', 'for');
    const dono = mon.map(({ x, i, it }) => row(`${it.n}${x.t === 'r' && x.w ? ' <span class="rounded bg-emerald-900/60 px-1.5 text-[10px] text-emerald-300">vestida</span>' : ''}`,
      `<div class="flex items-center gap-2">${x.t === 'r' ? `<button data-act="ewear" data-k="${i}" class="rounded bg-slate-800 px-2 py-1 text-xs text-amber-300">${x.w ? 'Tirar' : 'Vestir'}</button>` : ''}<button data-act="edel" data-k="${i}" class="${BT}">×</button></div>`,
      `${infoEq(x.t, it)}${x.t === 'r' && armaEf < it.rq ? ' <span class="text-red-400">(sua Armadura é baixa demais)</span>' : ''}`)).join('');
    const sub: [string, string][] = [['a', 'Armas'], ['r', 'Armaduras'], ['e', 'Itens']];
    const cat = catalogo(esub), gname = (i: Item) => (esub === 'a' ? i.c[0] : esub === 'r' ? i.cl : GRUPOS_EQ[i.g] ?? i.g) as string;
    const grupos = [...new Set(cat.map(gname))].sort();
    const lista = grupos.map(g => `<details data-g="eq:${esub}:${g}" class="rounded-lg bg-slate-900/50 px-3" ${open.has(`eq:${esub}:${g}`) || q ? 'open' : ''}><summary class="cursor-pointer py-2 text-amber-300">${g}</summary>${cat.filter(i => gname(i) === g).map(i => `<div data-n="${i.n.toLowerCase()}" class="flex items-center justify-between gap-3 border-t border-slate-800 py-2 ${q && !i.n.toLowerCase().includes(q) ? 'hidden' : ''}"><div><div class="text-sm">${i.n}</div><div class="text-xs text-slate-500">${fmt(cobre(i.p))}, ${i.w} kg${infoEq(esub, i) ? ', ' + infoEq(esub, i) : ''}</div></div><button data-act="eadd" data-k="${esub}:${i.id}" class="rounded bg-slate-800 px-3 py-1 text-sm text-amber-300 hover:bg-amber-500 hover:text-slate-950">Comprar</button></div>`).join('')}</details>`).join('');
    const kg = mon.reduce((a, m) => a + m.it.w, 0);
    return card('Dinheiro', `<div class="flex flex-wrap items-center gap-3 text-sm">${['ouro', 'prata', 'cobre'].map((n, k) => `<label class="flex items-center gap-1">${n}<input type="number" min="0" data-f="ouro" data-k="${k}" value="${s.ouro[k]}" class="w-20 rounded bg-slate-900 px-2 py-1 text-right ring-1 ring-slate-700"></label>`).join('')}<span class="${saldo() < 0 ? 'text-red-400' : 'text-amber-300'}">Saldo: <b class="font-mono">${fmt(saldo())}</b></span><span class="text-slate-500">1 ouro = 10 pratas = 100 cobres</span></div>`) +
      card('Seus itens', (dono || '<p class="text-sm text-slate-500">Nada comprado ainda.</p>') + (mon.length ? `<p class="mt-2 text-sm text-slate-400">Peso total: ${Math.round(kg * 10) / 10} kg${vest.length ? `. Proteção vestida: ${TIPOS.map((n, k) => `${n} ${ta[k]}`).join(', ')}. Penalizador natural ${vest.reduce((a, v) => a + v.pn, 0)}, restrição de movimento ${vest.reduce((a, v) => a + v.rm, 0)}.` : ''}</p>` : '')) +
      `<div class="flex gap-2">${sub.map(([k, n]) => `<button data-act="esub" data-k="${k}" class="rounded-full px-4 py-1.5 text-sm ${esub === k ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}">${n}</button>`).join('')}<input data-q value="${busca}" placeholder="Buscar..." class="min-w-0 flex-1 rounded bg-slate-900 px-3 py-1.5 text-sm outline-none ring-1 ring-slate-700 focus:ring-amber-500"></div><div class="space-y-2">${lista}</div>`;
  }
  if (tab === 'vant') {
    const dis = vsub === 'd', P = pcs(s.vent), q = busca.toLowerCase();
    const sel = s.vent.map((x, i) => ({ x, i, v: vById(x.id) })).map(({ x, i, v }) => row(v.nome + (x.o ? ` (${ATTRS.find(a => a[0] === x.o)?.[1] ?? SKN[x.o] ?? CATN[x.o]})` : ''), `<div class="flex items-center gap-3"><span class="font-mono ${v.dis ? 'text-emerald-400' : 'text-amber-300'}">${v.dis ? '+' + -x.c : '-' + x.c} PC</span><button data-act="vdel" data-k="${i}" class="${BT}">×</button></div>`, v.gn)).join('');
    const grupos = [...new Set(vantagens.filter(v => v.dis === dis).map(v => v.gn))].sort();
    const lista = grupos.map(g => `<details data-g="${g}" class="rounded-lg bg-slate-900/50 px-3" ${open.has(g) || q ? 'open' : ''}><summary class="cursor-pointer py-2 text-amber-300">${g}</summary>${vantagens.filter(v => v.dis === dis && v.gn === g).map(v => {
      const c = v.custos[0], m = motivo(v, c);
      const sl = v.custos.length > 1 ? `<select data-vc="${v.id}" class="rounded bg-slate-800 px-1 py-1 text-sm">${v.custos.map(k => `<option>${k}</option>`).join('')}</select>` : `<span class="w-8 text-center font-mono text-sm">${c}</span>`;
      return `<div data-n="${v.nome.toLowerCase()}" class="flex items-center justify-between gap-3 border-t border-slate-800 py-2 ${q && !v.nome.toLowerCase().includes(q) ? 'hidden' : ''}" title="${v.desc.replace(/"/g, '&quot;')}"><span class="text-sm">${v.nome}${APLICA.has(v.ef) ? ' <span class="rounded bg-emerald-900/60 px-1.5 text-[10px] text-emerald-300">na ficha</span>' : ''}</span><div class="flex items-center gap-2">${OPC(v.lista) ? `<select data-vo="${v.id}" class="max-w-40 rounded bg-slate-800 px-1 py-1 text-sm">${OPC(v.lista)!.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select>` : ''}${sl}<button data-act="vadd" data-k="${v.id}" class="rounded bg-slate-800 px-3 py-1 text-sm text-amber-300 hover:bg-amber-500 hover:text-slate-950 disabled:opacity-40" ${m ? `disabled title="${m}"` : ''}>Adicionar</button></div></div>`;
    }).join('')}</details>`).join('');
    return card('Pontos de Criação', `<p class="text-sm text-slate-300">Livres: <b class="font-mono ${P.g < 0 ? 'text-red-400' : 'text-amber-300'}">${P.g}</b>${P.d ? ` | Don: ${P.d}` : ''}${P.p ? ` | Psíquicas: ${P.p}` : ''}${P.t ? ` | Antecedentes: ${P.t}` : ''}. Até 3 desvantagens, cada uma devolve PC.</p>${sel}`) +
      `<div class="flex gap-2">${[['v', 'Vantagens'], ['d', 'Desvantagens']].map(([k, n]) => `<button data-act="vsub" data-k="${k}" class="rounded-full px-4 py-1.5 text-sm ${vsub === k ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}">${n}</button>`).join('')}<input data-q value="${busca}" placeholder="Buscar..." class="min-w-0 flex-1 rounded bg-slate-900 px-3 py-1.5 text-sm outline-none ring-1 ring-slate-700 focus:ring-amber-500"></div>` +
      `<div class="space-y-2">${lista}</div>`;
  }
  if (tab === 'mag') {
    const lim = Math.floor(K().limSob * total()), g = gasto(MAGK), viaMax = Math.floor(total() / 10);
    return card('Magia', MAG.map(([k, n, st, a]) => row(n, step('pt', k, s.pts[k] || 0, st) + `<div class="w-16 text-right font-mono text-amber-300">${finalMag(k, a)}</div>`,
      k === 'zeon' ? `${K().zeon} PD por 5 Zeon, base ${zeonBase(A('pod'))} (Poder)` : k === 'via' ? `1 PD por nível, máximo ${viaMax} PD` : `${preco(k)} PD por ponto`)).join('') +
      `<p class="mt-3 text-sm ${g > lim || (s.pts.via || 0) > viaMax ? 'text-red-400' : 'text-slate-400'}">Sobrenatural: ${g}/${lim} PD (limite da classe)</p>`);
  }
  if (tab === 'sob') return card('Psíquico', SOBRE.map(([k, n]) => row(n, step('pt', k, s.pts[k] || 0, 5), `${K()[k]} PD por ponto`)).join('') +
      `<p class="mt-3 text-sm ${gasto(['psi']) > Math.floor(K().limPsi * total()) ? 'text-red-400' : 'text-slate-400'}">Psíquico: ${gasto(['psi'])}/${Math.floor(K().limPsi * total())} PD (limite da classe)</p>`);
  if (tab === 'sec') {
    const u = natUso();
    return card('Bônus natural', `<p class="text-sm ${natOk() ? 'text-slate-400' : 'text-red-400'}">${semNat() ? 'Sem bônus natural (desvantagem).' : `Físico ${u.f}/${s.nivel}, mental ${u.m}/${s.nivel}${extraNat() ? `, extra ${u.sobra}/${s.nivel}` : ''}. Cada ponto soma de novo o bônus do atributo da habilidade.`}</p>`) +
      SEC.map(([g, n]) => card(`${n} <span class="text-sm text-slate-500">${K()[g]} PD por ponto</span>`, SKS.filter(h => h.g === g).map(h => row(h.nome,
        `<div class="flex items-center gap-3"><div class="text-center"><div class="text-[10px] text-slate-500">pts</div>${step('pt', h.id, s.pts[h.id] || 0, 5)}</div>${semNat() ? '' : `<div class="text-center"><div class="text-[10px] text-slate-500">nat</div>${step('nat', h.id, s.nat[h.id] || 0)}</div>`}<span class="w-12 text-right font-mono text-amber-300">${skFinal(h)}</span></div>`,
        `${h.a.toUpperCase()} ${bonus(A(h.a)) >= 0 ? '+' : ''}${bonus(A(h.a))}${reducao(h) ? `, custo ${precoSk(h)} PD (reduzido)` : ''}${bonusVant(h) ? `, vantagens +${bonusVant(h)}` : ''}`)).join(''))).join('');
  }
  const soma = Object.values(s.elan).reduce((a, b) => a + b, 0);
  const col = (tipo: string) => card(tipo, elanData.filter(g => g.tipo === tipo).map(g => {
    const sync = s.elan[g.nome] || 0, gasto = elSpent(g);
    const dons = g.dons.map(d => {
      const tem = s.dons.includes(d.id), m = tem ? '' : elMotivo(g, d);
      return `<div class="flex items-center justify-between gap-2 border-t border-slate-800 py-1.5 text-sm"><div><span class="${tem ? 'text-amber-300' : ''}">${d.nome}</span><div class="text-xs text-slate-500">custo ${d.c}, mín. ${d.min}${d.req.length ? `, requer ${d.req.map(r => g.dons.find(x => x.id === r)?.nome ?? r).join(', ')}` : ''}</div></div><button data-act="edon" data-k="${d.id}" class="rounded px-3 py-1 ${tem ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950'} disabled:opacity-40" ${m ? `disabled title="${m}"` : ''}>${tem ? 'Remover' : 'Adquirir'}</button></div>`;
    }).join('');
    return `<details data-g="elan:${g.nome}" class="rounded-lg bg-slate-900/50 px-3" ${open.has('elan:' + g.nome) ? 'open' : ''}><summary class="flex cursor-pointer items-center justify-between py-2"><span class="text-amber-300">${g.nome}</span><span class="font-mono text-xs text-slate-400">${sync ? `${sync - gasto}/${sync} livres` : 'sem Elan'}</span></summary>${row('Sincronização', step('elan', g.nome, sync, 5), 'mínimo = o já gasto em dons')}${dons}</details>`;
  }).join('<div class="h-2"></div>'));
  return `<div class="grid gap-4 md:grid-cols-2">${col('Beryl')}${col('Shajad')}</div><p class="mt-3 text-sm text-slate-400">Sincronização total: ${soma}. Dons adquiridos: ${s.dons.length}.</p>`;
}

function render() {
  const pct = clamp((dpGasto() / total()) * 100, 0, 100), duas = ['atr', 'cmb', 'sec'].includes(tab);
  document.getElementById('app')!.innerHTML = `
  <header class="sticky top-0 z-10 border-b border-amber-500/30 bg-slate-950/95 backdrop-blur">
    <div class="mx-auto max-w-6xl space-y-2 px-3 pt-2">
      <div class="space-y-2 sm:flex sm:items-center sm:gap-2 sm:space-y-0">
      <div class="flex items-center gap-2 sm:contents">
        <input data-f="nome" value="${s.nome.replace(/"/g, '&quot;')}" placeholder="Nome do personagem" class="min-w-0 flex-1 rounded bg-slate-900 px-3 py-1.5 font-serif sm:order-1 text-lg text-amber-300 outline-none ring-1 ring-slate-700 focus:ring-amber-500">
        <div class="flex gap-1 sm:order-4">${[['tema', document.documentElement.classList.contains('light') ? '☾' : '☀', 'Tema claro/escuro'], ['export', '⇩', 'Exportar'], ['import', '⇧', 'Importar'], ['reset', '↺', 'Novo']].map(([a, ic, n]) => `<button data-act="${a}" title="${n}" aria-label="${n}" class="h-9 rounded bg-slate-800 px-2.5 text-sm hover:bg-slate-700">${ic}<span class="ml-1 hidden lg:inline">${n}</span></button>`).join('')}</div>
      </div>
      <div class="flex items-center gap-2 sm:contents">
        <select data-f="classe" class="min-w-0 flex-1 rounded bg-slate-900 px-2 py-1.5 text-sm ring-1 ring-slate-700 sm:order-2 sm:flex-none">${classes.map(c => `<option value="${c.id}" ${c.id === s.classe ? 'selected' : ''}>${c.nome}</option>`).join('')}</select>
        <div class="ml-auto flex items-center gap-2 sm:order-3 sm:ml-0"><span class="text-xs uppercase tracking-widest text-slate-500">Nível</span>${step('lvl', '', s.nivel)}</div>
      </div>
      </div>
      <div class="-mx-3 flex snap-x scroll-px-3 gap-2 overflow-x-auto px-3 pb-1 lg:[&>*]:flex-1">${chip('PD livres', dpLivre(), dpLivre() < 0)}${chip('PC', pcLivres(), pcLivres() < 0, 'text-emerald-300')}${chip('Vida', pv(), false, 'text-rose-300')}${chip('Iniciativa', ini())}${chip('Ki', kiTotal(), false, 'text-sky-300')}${chip('Zeon', finalMag('zeon', ''), false, 'text-violet-300')}${chip('PD total', total(), false, 'text-slate-300')}</div>
      <div class="h-1.5 overflow-hidden rounded bg-slate-800"><div class="h-full ${dpLivre() < 0 ? 'bg-red-500' : 'bg-amber-500'} transition-all" style="width:${pct}%"></div></div>
    </div>
    <nav class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 max-sm:[mask-image:linear-gradient(to_right,#000_88%,transparent)]">${TABS.map(([k, n]) => `<button data-act="tab" data-k="${k}" class="whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${tab === k ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}">${n}</button>`).join('')}</nav>
  </header>
  <main class="mx-auto max-w-6xl px-3 py-4 pb-16 ${duas ? 'lg:columns-2 lg:gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid [&>:only-child]:[column-span:all]' : 'space-y-4'}">${painel()}</main>`;
  document.querySelector('nav .bg-amber-500')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

const ESP: Record<string, string> = { 'Habilidad de Ataque': 'atk', 'Habilidad de Parada': 'par', 'Habilidad de Esquiva': 'esq', 'Llevar Armadura': 'arm', 'Proyección Mágica': 'mag', 'Proyección Psíquica': 'psi', Zeon: 'zeon', ACT: 'act', HB_REGENERACION_ZEONICA: 'reg', HB_NIVEL_DE_VIA: 'via', Convocar: 'conv', Dominar: 'dom', Atar: 'ata', Desconvocar: 'des' };
for (const [k, n] of [['Agilidad', 'agi'], ['Constitución', 'con'], ['Destreza', 'des'], ['Fuerza', 'for'], ['Poder', 'pod'], ['Voluntad', 'von']]) { ESP['Ki ' + k] = 'ki_' + n; ESP['Acumulación Ki ' + k] = 'acu_' + n; }
const ATK: Record<string, string> = { AGI: 'agi', CON: 'con', DES: 'des', FUE: 'for', INT: 'int', PER: 'per', POD: 'pod', VOL: 'von' };
/* eslint-disable @typescript-eslint/no-explicit-any */
function importarAntigo(o: any): string[] {
  const av: string[] = [], n = novo(), L = legado as Record<string, Record<string, string>>;
  const cl = classes.find(c => (c as { cat?: string }).cat === o.categoria);
  if (cl) n.classe = cl.id; else av.push(`Classe não reconhecida (${o.categoria}); usei ${C().nome}.`);
  n.nome = o.nombre || ''; n.nivel = clamp(Number(o.nivel) || 1, 1, 30); n.sexo = o.sexo === 'Mujer' ? 'm' : 'h';
  if (racas.some(r => r.id === o.raza)) n.raca = o.raza; else av.push(`Raça não reconhecida (${o.raza}).`);
  for (const x of [...(o.ventajas ?? []), ...(o.desventajas ?? [])]) {
    if (x.origen !== 'ORIGEN_PC') continue;
    const v = vantagens.find(y => y.id === x.ventaja);
    if (!v) { av.push(`Vantagem/desvantagem não encontrada: ${x.ventaja}.`); continue; }
    const c = v.custos.includes(x.pc) ? x.pc : v.custos.includes(-x.pc) ? -x.pc : v.custos[0];
    const op = v.lista === 'LISTA_CARACTERISTICAS' ? ATK[x.opcion] : v.lista === 'LISTA_HABILIDADES_SECUNDARIAS' ? L.sk[x.opcion] : v.lista === 'LISTA_TIPOS_SECUNDARIAS' ? L.tipos[x.opcion] : undefined;
    if (v.lista && !op) av.push(`Opção não reconhecida em "${v.nome}" (${x.opcion}).`);
    n.vent.push(op ? { id: v.id, c, o: op } : { id: v.id, c });
  }
  s = n;
  ATTRS.forEach(([k], i) => {
    const d = n.vent.reduce((a, x) => a + (x.o === k ? (ef(x) === 'sumarUnoAUnaCaracteristica' ? 1 : ef(x) === 'restarDosAUnaCaracteristica' ? -2 : 0) : 0), 0);
    n.at[k] = clamp((o.caracteristicas?.[i] ?? 5) - rAt(k) - d, 1, 20);
  });
  for (const h of o.allHabilidades ?? []) {
    const k = ESP[h.habilidad] ?? L.sk[h.habilidad], pd = Number(h.PDinvertidos) || 0;
    const st = ['act', 'reg', 'via'].includes(k) || k?.startsWith('ki_') || k?.startsWith('acu_') ? 1 : 5;
    if (k && pd && preco(k) > 0) n.pts[k] = Math.round(pd / preco(k) / st) * st;
  }
  const vm = o['Múltiplos de vida']?.PDinvertidos; if (vm && K().vidaMult) n.vida = Math.round(vm / K().vidaMult);
  for (const b of o.bonificadoresNaturales ?? []) for (const f of ['fisico', 'mental', 'extra']) { const id = L.sk[b?.[f]]; if (id) n.nat[id] = (n.nat[id] || 0) + 1; }
  for (const e of o.elan ?? []) {
    const g = elanData.find(x => x.id === e.nombre);
    if (!g) { av.push(`Elan não reconhecido: ${e.nombre}.`); continue; }
    n.elan[g.nome] = Number(e.sincronizacion) || 0;
    for (const d of e.dones ?? []) { const id = typeof d === 'string' ? d : d.nombre; if (g.dons.some(x => x.id === id)) n.dons.push(id); else av.push(`Dom de Elan não reconhecido: ${id}.`); }
  }
  for (const v of o.viasMagia ?? []) {
    const id = L.vias[v.via] ?? v.via;
    if (magia.vias.some(x => x.id === id)) n.vias.push({ id, n: Number(v.nivel) || 0 }); else av.push(`Via não reconhecida: ${v.via}.`);
    if (v.conjurosLibres?.length) av.push('Os feitiços livres escolhidos não foram importados; escolha de novo na aba Vias.');
  }
  const add = (t: string, lista: any[], campo: string, vest = false) => { for (const x of lista ?? []) { const id = x[campo]; if (catalogo(t).some(i => i.id === id)) n.eq.push({ t, id, ...(vest && x.equipado ? { w: true } : {}) }); else av.push(`Item não encontrado: ${id}.`); } };
  add('a', o.armas, 'arma'); add('r', o.armaduras, 'armadura', true); add('e', o.equipoComprado, 'equipoComprado');
  const rest = ((o.dinero?.oro || 0) * 100) + ((o.dinero?.plata || 0) * 10) + (o.dinero?.cobre || 0), tot = rest + n.eq.reduce((a, x) => a + cobre(itemDe(x).p), 0);
  n.ouro = [Math.floor(tot / 100), Math.floor((tot % 100) / 10), tot % 10];
  for (const k of ['tecnicasKi', 'artesMarciales', 'disciplinasPsiquicas', 'arsMagnus', 'conjurosSueltos', 'esferasMetamagicas']) if (o[k]?.length) av.push(`Não importado (ainda não existe no novo sistema): ${k}.`);
  s = n;
  return av;
}
const save = () => localStorage.setItem(KEY, JSON.stringify(s));
const app = document.getElementById('app')!;
app.addEventListener('click', e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!t) return;
  const { act, k = '', d = '0' } = t.dataset, n = Number(d);
  if (act === 'tab') { tab = k; busca = ''; }
  else if (act === 'lvl') s.nivel = clamp(s.nivel + n, 1, 30);
  else if (act === 'at') s.at[k] = clamp(s.at[k] + n, 1, 20);
  else if (act === 'pt') s.pts[k] = Math.max(0, (s.pts[k] || 0) + n);
  else if (act === 'vida') s.vida = Math.max(0, s.vida + n);
  else if (act === 'elan') s.elan[k] = clamp((s.elan[k] || 0) + n, elSpent(elanData.find(g => g.nome === k)!), 100);
  else if (act === 'edon') {
    const g = elanData.find(x => x.dons.some(d => d.id === k))!, d = g.dons.find(x => x.id === k)!;
    if (s.dons.includes(k)) rmDon(k);
    else if (!elMotivo(g, d)) s.dons.push(k);
    else return;
  }
  else if (act === 'nat') {
    const antes = s.nat[k] || 0;
    s.nat[k] = Math.max(0, antes + n);
    if (n > 0 && !natOk()) { s.nat[k] = antes; return; }
  }
  else if (act === 'viaadd') {
    const sel = app.querySelector<HTMLSelectElement>('select[data-vsel]');
    if (!sel?.value || s.vias.some(v => v.id === sel.value)) return;
    s.vias.push({ id: sel.value, n: 0 });
  }
  else if (act === 'viadel') { const v = s.vias.splice(Number(k), 1)[0]; if (v) { s.vias.push(v); s.vias.pop(); for (const key of Object.keys(s.livres)) if (key.startsWith(v.id + ':')) delete s.livres[key]; } }
  else if (act === 'via') {
    const i = s.vias.findIndex(v => v.id === k), nv = s.vias[i].n + n;
    if (nv < 0 || nv > NMAX || (n > 0 && viaGasto() + n * viaCoste(i) > viaPool())) return;
    s.vias[i].n = nv; limpaLivres(k);
  }
  else if (act === 'esub') esub = k;
  else if (act === 'eadd') { const [tp, id] = k.split(':'); s.eq.push({ t: tp, id }); }
  else if (act === 'edel') s.eq.splice(Number(k), 1);
  else if (act === 'ewear') s.eq[Number(k)].w = !s.eq[Number(k)].w;
  else if (act === 'vsub') vsub = k;
  else if (act === 'vdel') s.vent.splice(n === 0 ? Number(k) : 0, 1);
  else if (act === 'vadd') {
    const v = vById(k), sel = app.querySelector<HTMLSelectElement>(`select[data-vc="${k}"]`), c = sel ? Number(sel.value) : v.custos[0];
    if (motivo(v, c)) return;
    const so = app.querySelector<HTMLSelectElement>(`select[data-vo="${k}"]`);
    s.vent.push(so ? { id: k, c, o: so.value } : { id: k, c });
  }
  else if (act === 'tema') { const l = document.documentElement.classList.toggle('light'); localStorage.setItem('anima-tema', l ? 'light' : 'dark'); }
  else if (act === 'reset') { if (!confirm('Começar um personagem novo?')) return; s = novo(); }
  else if (act === 'import') { document.getElementById('imp')!.click(); return; }
  else if (act === 'export') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
    a.download = `${s.nome || 'personagem'}.anima.json`; a.click(); return;
  }
  save(); render();
});
app.addEventListener('change', e => {
  const t = e.target as HTMLInputElement;
  if (t.dataset.f === 'nome') s.nome = t.value;
  else if (t.dataset.f === 'classe') s.classe = t.value;
  else if (t.dataset.f === 'raca') s.raca = t.value;
  else if (t.dataset.f === 'sexo') s.sexo = t.value;
  else if (t.dataset.f === 'ouro') s.ouro[Number(t.dataset.k)] = Math.max(0, Math.floor(Number(t.value)) || 0);
  else if (t.dataset.f === 'livre') { if (t.value) s.livres[t.dataset.k!] = t.value; else delete s.livres[t.dataset.k!]; }
  else return;
  save(); render();
});
app.addEventListener('input', e => {
  const t = e.target as HTMLInputElement;
  if (!('q' in t.dataset)) return;
  busca = t.value;
  const q = busca.toLowerCase();
  app.querySelectorAll<HTMLElement>('[data-n]').forEach(r => r.classList.toggle('hidden', !!q && !r.dataset.n!.includes(q)));
  app.querySelectorAll<HTMLDetailsElement>('details[data-g]').forEach(d => { d.open = !!q || open.has(d.dataset.g!); });
});
app.addEventListener('toggle', e => {
  const d = e.target as HTMLDetailsElement;
  if (d.dataset.g && (tab !== 'vant' || !busca)) d.open ? open.add(d.dataset.g) : open.delete(d.dataset.g);
}, true);
document.getElementById('imp')!.addEventListener('change', async e => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    if (j && j.allHabilidades) { const av = importarAntigo(j); save(); render(); alert('Personagem do sistema antigo importado.' + (av.length ? '\n\nAvisos:\n- ' + [...new Set(av)].join('\n- ') : '')); }
    else { s = { ...novo(), ...j }; save(); render(); }
  } catch { alert('Arquivo inválido.'); }
});
render();
