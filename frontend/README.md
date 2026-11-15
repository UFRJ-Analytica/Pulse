# Pulse Health

Atlas anatômico 3D e painel de evidências para o NASA Space Apps 2026. Implementado a partir de [Design.md](./Design.md) e da especificação de [indicadores de radiação](../notebooks/eda_donki/indicadores_radiacao.md).

React 19 + TypeScript + Vite + Three.js + Recharts. A demonstração é estática, funciona sem credenciais e não requer backend. Os dados de missão são **sintéticos**; as geometrias anatômicas são reais, do Human Reference Atlas / HuBMAP.

## Executar

Requisitos: Node.js 22.12 ou superior; npm 11 recomendado.

```bash
cd frontend
npm ci
npm run dev
```

Abra a URL mostrada pelo Vite, normalmente `http://127.0.0.1:5173`. Todos os recursos necessários, incluindo a anatomia de 11 MB, são servidos localmente. Os links de referência externos são opcionais. Não há fontes remotas, chaves de API, telemetria ou requisições de dados de missão na demonstração.

Se o npm 10 apresentar o erro interno `Cannot read properties of null (reading 'edgesOut')` ao resolver peers, use `npx --yes npm@11.6.2 ci`. O lockfile é versionado.

```bash
npm run lint
npm run typecheck
npm test
npm run test:interaction
npm run build
npm run preview
```

`dist/` contém o site de produção e todos os assets locais. Sirva essa pasta por HTTP; abrir o HTML diretamente com `file://` não carrega módulos ou GLB corretamente. O endereço padrão do preview é `http://127.0.0.1:4173`.

## Experiência

- Layout com sinais à esquerda, anatomia ao centro, inspeção à direita e linha do tempo abaixo.
- Busca por nome, código de indicador ou identificador HRA / UBERON / FMA. `Cmd/Ctrl+K` foca a busca.
- 25 indicadores: D01–D06, R01–R09, O01–O07 e C01–C03. A biblioteca “Indicadores” e a aba “Todos os sinais” dão acesso ao catálogo inteiro.
- Nove cenários: rotina, SEP moderado, alta energia com dose ausente, tendência persistente de dose, mesma dose com LET diferente, coleta tardia, ausência de pares, fonte atrasada/inválida e protocolo crítico.
- Tour de cinco etapas: ambiente → dosimetria → qualidade → resposta → confirmação da evidência.
- Em mobile, sinais abrem em painel lateral e a inspeção em bottom sheet. A anatomia selecionada permanece enquadrada na região superior.
- Datas dos sinais são apresentadas explicitamente em UTC. As janelas de 12, 24 e 48 horas filtram a série disponível; a tabela fornece alternativa textual ao gráfico.

### Controles do atlas

| Ação | Controle |
|---|---|
| Girar | Arraste ou use setas com o explorador focado |
| Pan | Botão direito / gesto de dois dedos; Alt + setas |
| Zoom | Roda / pinça; `+` e `−`; botões da barra |
| Câmera | Frontal, posterior, lateral, superior, inferior e foco anatômico |
| Selecionar | Clique na malha, label, árvore de camadas ou resultado de busca |
| Isolar / ocultar | Botões da seleção; `I` / `H` com o explorador focado |
| Visibilidade | Checkbox por sistema e botão por estrutura; atalho “Somente órgãos” |
| Montar / separar | “Montado” / “Explodido”; slider e animação em Aparência |
| Material | Anatômico, porcelana, wireframe, transparente ou destaque |
| Corte | Axial, sagital ou coronal, posição e sentido reversível |
| Desfazer | Botão ou `Cmd/Ctrl+Z` no explorador |
| Restaurar | Botão ou `Home` no explorador |
| Apresentação | Rotação opcional, fullscreen e exportação PNG |

Os planos produzem cortes abertos de visualização; não são tomografia. O layout totalmente separado usa células sem sobreposição no plano frontal. A posição original é preservada ao remontar. Os rótulos são limitados e filtrados por colisão e clipping. Preferência por movimento reduzido é respeitada; o desenho WebGL só é atualizado quando necessário, com DPR limitado.

## Anatomia e atribuição

HRA / HuBMAP **United Male v1.5 (2023)**, **CC BY 4.0**, de Kristen Browne e Heidi Schlehlein. Foram preservadas 849 estruturas de origem, agrupadas em **46 grupos 3D selecionáveis**, totalizando 456.876 triângulos. Esqueleto e musculatura têm cobertura parcial; não há estômago ou malha celular nesta seleção. Não é um modelo individual de astronauta.

- [ATTRIBUTION.md](./ATTRIBUTION.md): créditos, licenças, adaptações e fontes oficiais.
- [Catálogo](./src/anatomy/catalog.ts): hierarquia navegável, IDs, regiões, conceitos e limitações.
- [Manifesto](./public/anatomy/manifest.json): relações originais, buffers, contagens e SHA-256.
- [Dados locais de anatomia](./public/anatomy): GLB, metadados e script de preparação reproduzível.

Não foi usado BodyParts3D. Cores anatômicas identificam estruturas, nunca dose, diagnóstico ou dano. O halo de exposição significa exclusivamente “exposição medida no ponto do dosímetro; não é dose específica do órgão”.

## Contratos e integração

```text
src/
  App.tsx                      coordenação de navegação e seleção
  components/
    AtlasViewer.tsx             controles e histórico do atlas
    AnatomyScene.tsx            ciclo Three.js, picking, clipping e labels
    IndicatorInspector.tsx     explicação, evidência e limitações
    Timeline.tsx                séries, eventos e tabela acessível
    SignalUI.tsx                cards e estados
  anatomy/                     catálogo, layout e visibilidade
  data/
    types.ts                   contratos IndicatorRecord / MissionScenario
    catalog.ts                 25 definições e documentação oficial
    formulas.ts                cálculos puros e guardas de qualidade
    fixtures.ts                cenários determinísticos sintéticos
    adapters/{donki,rad,osdr}.ts normalização por fonte
  i18n/pt-BR.ts                 fronteira inicial do dicionário de interface
```

A interface consome contratos normalizados; a normalização e as fórmulas não dependem dos componentes. Para integrar uma API, obtenha os dados fora da camada visual e passe-os aos adaptadores. Consulte [src/data/README.md](./src/data/README.md) para os formatos e regras. Complete um `MissionScenario` com `records`, `timeline` e `events`; substitua o provedor local de cenários na composição da aplicação. Preserve `null` para ausências e mantenha o timestamp do instrumento, não o horário do fetch.

As fontes têm semânticas diferentes: DONKI descreve ambiente; RAD mede a exposição no rover e não pode ser apresentado como dosímetro humano; OSDR é evidência de experimentos, não telemetria clínica. A fixture usa um dosímetro hipotético de habitat no **esquema** do RAD, sem transferir medições reais de Marte para uma pessoa.

Integrações autenticadas futuras devem usar um backend (por exemplo NestJS/TypeScript em `../backend`), sem inserir segredos em variáveis `VITE_*`. Nenhum backend foi necessário para este escopo. A versão inicial é em português; textos de catálogo estão separados dos componentes e há um dicionário inicial para expansão de locale. Uma tradução completa ainda precisa extrair os textos de apresentação restantes.

### Limites científicos deliberados

- Pesos do score ambiental são **demonstrativos**, explicitados e versionados. Não constituem índice oficial NASA.
- R03 e R07 permanecem sem valor porque a complementaridade B/E não foi validada. O adaptador exige uma opção explícita para habilitar a soma.
- Q(LET) é provisório. O produto Dose × Q mantém a unidade **proxy µSv/h**, nunca sievert oficial ou dose clínica.
- R08 integra somente o canal B nas **48 horas disponíveis**, sem extrapolar o início da missão. Só há contexto de habitat; outras fases não têm dosimetria segmentada.
- R09 requer persistência em três amostras; um ponto isolado não gera alarme de tendência.
- O01–O07 mostram um ensaio/medição exemplificativo por categoria, coleta, baseline e confundidores. Ensaios restantes e latência causal são explicitamente ausentes ou não estabelecidos.
- C01–C03 têm `n = 0` pares observacionais reais, sem Pearson/Spearman inventados. Dados sintéticos não se tornam evidência clínica.
- Versões: `pulse-exploratory-v1` e `pulse-demo-thresholds-v1`.

## Validação

Os testes Vitest verificam fórmulas, normalização, ausências, qualidade, contratos dos nove cenários e proteção contra soma/correlação indevidas. Os testes de geometria leem o **GLB real**, validando buffers finitos, índices, bounding boxes, hierarquia e contagens. O teste do layout explodido usa os limites dos 46 grupos reais.

Os testes de interação montam a aplicação com Testing Library e substituem somente a cena WebGL por uma fronteira carregada, para exercitar os fluxos de interface sem simular suporte gráfico do JSDOM. Eles cobrem seleção por identificador, contexto de órgãos, isolamento/ocultação/undo/reset, troca de indicador após isolamento, clipping, filtro do catálogo, cenários, tabela temporal, fonte/licença e tour completo. O renderizador real requer a revisão no navegador abaixo.

Revisão manual com Chrome em desktop e emulação iPhone 16 (393 × 852): anatomia carregada, busca/seleção e zoom do coração, isolamento, painel mobile, cenário crítico, fonte inválida, clipping axial e inversão, camadas, visualização explodida, timeline e reset. Após carga limpa, console sem erros ou avisos da aplicação. A emulação não substitui teste de desempenho em um aparelho físico.

Para repetir a revisão visual:

1. Abra a página, espere “46 estruturas visíveis” e selecione coração; confira o enquadramento e a fonte HRA.
2. Isole, oculte, desfaça e restaure. Troque sistemas, material, câmera e corte; inverta o sentido.
3. Separe a anatomia, ajuste o slider e remonte. Verifique que não há sobreposição no layout frontal totalmente separado.
4. Alterne os nove cenários. Verifique unidades, qualidade, incertezas, data UTC e ausência de dose/pares onde aplicável.
5. Use a timeline e sua tabela, execute as cinco etapas do tour e abra as atribuições.
6. Repita em 393 px, navegue com teclado, confira os painéis e inspecione console/overflow.
