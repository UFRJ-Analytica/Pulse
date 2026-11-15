# Backend e navegação — Analytica Pulse

## Decisão de arquitetura

- **Frontend:** React + TypeScript + Vite. É responsável por renderizar páginas, URLs, navegação do browser e idioma.
- **Backend:** NestJS + TypeScript. É responsável por APIs versionadas, validação, acesso a fontes externas e regras de negócio. O NestJS não cria as páginas do site.
- **Idioma:** inglês (`en`) e português do Brasil (`pt-BR`). O idioma aparece na URL como `en` e `pt-br`; o inglês é o idioma padrão por ser uma aplicação voltada à NASA. A seleção explícita do usuário deve ser persistida e usada no próximo acesso.
- **Compatibilidade:** textos traduzidos ficam na camada de apresentação. IDs de indicadores, nomes de campos da API, unidades e identificadores de fontes não mudam com o idioma.

## URLs públicas do frontend

| Página | Inglês | Português |
| --- | --- | --- |
| Highlights | `/en/highlights` | `/pt-br/highlights` |
| Sono (indicador dentro de biomarcadores) | `/en/highlights/biomarkers/sleep-hours` | `/pt-br/highlights/biomarkers/sleep-hours` |
| Atlas da missão | `/en/mission-atlas` | `/pt-br/mission-atlas` |
| Catálogo de indicadores | `/en/indicators` | `/pt-br/indicators` |
| Sobre os dados | `/en/data-sources` | `/pt-br/data-sources` |

`/` redireciona para `/en/highlights`. Uma preferência de idioma já salva pode ajustar esse destino. Ao trocar o idioma, a aplicação mantém a mesma página (por exemplo, `/en/mission-atlas` → `/pt-br/mission-atlas`). Rotas desconhecidas mostram uma página 404 com retorno para Highlights. O navegador deve conseguir abrir e atualizar qualquer URL acima diretamente.

Os nomes de URL são estáveis e em inglês nos dois idiomas; só os textos visíveis são traduzidos. O sono fica sob `highlights/biomarkers` porque é um detalhe de biomarcador alcançado a partir dos destaques. Se a área de biomarcadores crescer e virar um destino próprio, a rota poderá evoluir para `/biomarkers/sleep-hours` com redirecionamento da URL antiga.

## API NestJS

Todas as rotas da API usam o prefixo `/api/v1`. O prefixo de idioma não é necessário na API: a mesma resposta de dados serve às duas interfaces; quando um endpoint retornar texto editorial, receberá `Accept-Language: en` ou `Accept-Language: pt-BR`.

| Endpoint | Responsabilidade inicial |
| --- | --- |
| `GET /api/v1/health` | Estado e versão do serviço |
| `GET /api/v1/highlights` | Resumo agregado exibido em Highlights |
| `GET /api/v1/biomarkers/sleep-hours` | Série temporal e metadados do sono |
| `GET /api/v1/indicators` | Catálogo, unidade, fonte, qualidade e limitações |
| `GET /api/v1/indicators/:indicatorId` | Detalhe de um indicador |
| `GET /api/v1/data-sources` | Proveniência, licença e limitações dos conjuntos de dados |

O atlas anatômico e os arquivos de referência continuam estáticos no frontend enquanto não houver necessidade de busca ou processamento no servidor. Não criar endpoints de escrita, comandos de wearable ou interpretação clínica sem requisitos, fonte de dados real e validação definidos.

## Organização inicial do backend

```text
backend/
  src/
    main.ts                 # bootstrap, prefixo /api/v1, CORS e validação global
    app.module.ts
    health/                 # health.controller.ts e health.module.ts
    highlights/             # controller, service, DTOs
    biomarkers/sleep-hours/ # controller, service, DTOs
    indicators/             # controller, service, DTOs
    data-sources/            # controller, service, DTOs
    common/                  # filtros, interceptors e tipos compartilhados
  test/
  package.json
  tsconfig.json
  nest-cli.json
  .env.example
```

Cada módulo deve manter controllers HTTP finos, validação nos DTOs e lógica em services. Adaptadores de DONKI, RAD, OSDR e dados de sono devem ficar atrás de interfaces de serviço para que fixtures locais possam ser substituídas por fontes reais sem acoplar os componentes React à origem.

## Internacionalização

- Usar locale explícito (`en` ou `pt-BR`) na aplicação e catálogos de tradução separados por domínio, por exemplo `common`, `navigation`, `highlights`, `indicators`, `sleep` e `dataSources`.
- Traduzir também acessibilidade (`aria-label`, tooltips, estados vazios e mensagens de erro), datas, números e unidades formatáveis; preservar códigos e nomes oficiais das fontes.
- Textos científicos precisam manter o mesmo sentido, incerteza e ressalvas nos dois idiomas. O inglês deve ser a cópia de referência para apresentação à NASA.
- Não inferir conclusões de saúde a partir de exemplos sintéticos; traduzir e exibir claramente os avisos de demonstração.

## Estado e sequência de implementação

1. **Feito:** mover a seleção das telas para URLs com prefixo de idioma, deep links e página 404; preservar a tela ao alternar idioma.
2. **Em andamento:** seletor e catálogos iniciais `en` / `pt-BR`; Highlights, os principais controles e gráficos de sono e o modal Actiwatch já têm tradução. Ainda falta traduzir integralmente atlas, catálogo, painel de inspeção, sobre os dados e acessibilidade.
3. **Feito:** criar o esqueleto NestJS com `GET /api/v1/health`, CORS configurável, validação global e configuração local documentada.
4. Implementar módulos de leitura começando por `highlights` e `biomarkers/sleep-hours`; manter fixtures até a fonte e o contrato de produção estarem definidos.
5. Integrar o frontend à API por uma camada de cliente tipada, com estado de carregamento, erro e ausência de dados.

O frontend agora resolve as rotas públicas definidas acima. O NestJS oferece somente health check; os demais endpoints da tabela são contratos propostos, ainda não implementados. Os textos atuais das páginas ainda são majoritariamente em português e a internacionalização deve ser considerada incompleta até todas as telas e seus estados terem tradução revisada.
