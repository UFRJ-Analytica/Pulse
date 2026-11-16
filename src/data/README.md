# Contratos, adaptadores e fixtures

As definições vivem em `catalog.ts` (a exploração das fontes está em `research/`, na raiz do repositório); metadados por observação usam `IndicatorRecord` em `types.ts`.

Todos os valores desta demonstração são sintéticos e determinísticos. A referência temporal é `2026-11-05T14:00:00Z`, com 25 amostras em intervalos de duas horas. `missionId = demo-ares-01`; não é uma missão NASA real.

## Uso dos adaptadores

```ts
import { normalizeDonki, normalizeRad, normalizeOsdr } from './index';

const context = {
  missionId: 'identificador-real-da-missao',
  timestamp: '2026-11-05T14:00:00Z',
  synthetic: false,
};

// Valide o payload e a identidade da missão no serviço que obtém os dados.
const environment = normalizeDonki(donkiEvents, context);
const exposure = normalizeRad(radSamples, context, {
  channelsValidated: false,
  baselineSamples: baselineIndividual,
  maxGapHours: 3,
});
const response = normalizeOsdr(biologicalSamples, context);
```

`DonkiEvent` preserva sepID, eventTime, instruments, canal original, linkedEvents, notifications e link. `RadSample` recebe timestamp, Dose_B_uGy_h, Dose_E_uGy_h, LET_Energy_Centers, LET_Counts e detector. `BiologicalSample` recebe indicatorId, value, unit, baseline, collectionDate, biologicalDelay, confounders, context e uncertainty. Consulte os tipos exportados dos adaptadores; estes formatos são internos, não uma promessa de compatibilidade automática com qualquer endpoint.

## Guardas

- `finiteNumber` rejeita NaN, infinito, strings vazias, booleanos e coerção indevida de `null` para zero.
- Datas inválidas e qualidade inválida não produzem valores válidos. Ausência permanece `null`, sem imputação automática.
- DOSE B/E são separados; soma exige `channelsValidated: true` **após** validar instrumento, calibração, complementaridade e alinhamento.
- Espectros LET exigem arrays compatíveis, centros e contagens finitos/não negativos e massa de contagens positiva.
- Q(L): 1 para L < 10; 0,32L − 2,2 para 10 ≤ L ≤ 100; 300/√L para L > 100. Q ponderado é uma aproximação provisória.
- Integração retangular à esquerda não cruza gaps longos ou intervalos inválidos; preserva cobertura parcial e horas cobertas.
- Tendência usa mediana do baseline, +20% e pelo menos três amostras consecutivas na demonstração. Esses limiares são de produto, não clínicos.
- OSDR exige baseline individual e preserva coleta, contexto e confundidores. O valor de O06 é sono autorreferido, não avaliação neurológica completa.
- Correlação só deve ser habilitada para observações reais pareadas da mesma missão, com alinhamento, baseline, atraso, missing e confundidores tratados. Os cenários não satisfazem essa condição.

## Cenários

| ID | Condição exercitada |
|---|---|
| routine | baseline estável |
| sep-moderate | três registros SEP; score 44 |
| high-energy | canal ≥100 MeV; dosimetria ausente |
| dose-trend | dose acima do baseline em quatro amostras |
| high-let | mesma dose, espectro LET diferente |
| delayed-biology | coleta 24h após evento sintético |
| unpaired | sem pares reais para correlação |
| data-gap | DONKI atrasado, pacote de dose inválido e coleta ausente |
| hypoglycemia | glicemia de CGM em 48 mg/dL com FC e pressão alteradas e sintomáticas |
| sleep-debt | sete noites abaixo de 6 h, bem-estar e FC fora da linha de base pessoal |
| critical | score ambiental 100 e dose persistentemente elevada |

Os eventos de exercício, EVA e blindagem são anotações operacionais sintéticas, não medições de exposição segmentadas. Linhas do gráfico preservam lacunas; a acumulação não pode ser interpretada como dose de toda a missão. Mudanças de fixture devem manter a coerência entre cards, séries, eventos e inspeção, verificada em `fixtures.test.ts`.
