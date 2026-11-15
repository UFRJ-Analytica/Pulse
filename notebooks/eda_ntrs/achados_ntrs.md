# EDA NTRS: achados

Nov 1, 2026 · @Sylvio

## Fonte e recorte

Foram coletados 41.866 documentos únicos do NASA Technical Reports Server (NTRS), cobrindo 96,9% do recorte disponível na API.

O recorte é a divisão Life Sciences do esquema de categorias do NASA STI, exceto Exobiology, mais Space Radiation. O critério usa a classificação da própria NASA, em vez de termos de busca escolhidos pela equipe. O NTRS inteiro tem 648.500 documentos, a maioria de aeronáutica, propulsão e materiais.

| Categoria | Documentos na API | Coletados | Modo |
| --- | --- | --- | --- |
| Aerospace Medicine | 8.278 | 8.278 | Completa |
| Behavioral Sciences | 2.079 | 2.079 | Completa |
| Space Radiation | 9.618 | 9.618 | Completa |
| Life Sciences (General) | 11.835 | 10.960 | Fatiada por data |
| Man/System Technology and Life Support | 12.107 | 11.627 | Fatiada por data |

A API não pagina além do registro 10.000. As duas maiores categorias foram divididas por intervalo de data de publicação, e os 1.355 documentos sem data ficaram de fora. Documentos presentes em mais de uma categoria foram contados uma vez.

## Passos da EDA

A análise seguiu duas etapas: coleta pela API e exploração do corpus em notebook.

1. **Coleta:** teste da API, escolha das categorias pela classificação da NASA e download completo, com fatiamento por data para contornar o limite de paginação.
2. **Qualidade:** preenchimento de cada campo e identificação de inconsistências de cadastro.
3. **Limpeza:** extração de ano, centro, categorias padronizadas, número de autores e link do texto completo.
4. **Composição:** distribuição por ano, tipo de documento, categoria e centro.
5. **Indicadores:** busca por termos de cada indicador do desafio em títulos e resumos.
6. **Temas:** modelagem de tópicos (TF-IDF e NMF) sobre os resumos, para ver o que o corpus cobre além das categorias.
7. **Valores numéricos:** extração de números com unidades (mmHg, bpm, mSv etc.), primeiro sem filtro e depois exigindo o termo do indicador por perto.
8. **Sujeito:** classificação dos candidatos em estudos com humanos, animais ou células.
9. **Texto completo:** aplicação da mesma extração em 237 documentos baixados, para medir o ganho em relação aos resumos.

## Composição

O corpus é antigo e majoritariamente sem texto completo: a mediana de publicação é 1994, e só 54% dos documentos têm o texto disponível.

- **Tempo:** documentos de 1958 a 2026. O volume anual cai depois de 2017, de mais de 700 para 150 a 230 por ano. Picos em 1975, 1985 e 1992 correspondem a cargas de anais de congresso.
- **Texto completo:** oscila entre 20% e 60% até 2009 e passa de 90% a partir de 2010.
- **Centros:** JSC (17%) é o principal centro de pesquisa. O código `CDMS` aparece em 53% dos registros, mas não corresponde a um centro.

| Tipo de documento | Documentos | % do corpus | % com texto completo |
| --- | --- | --- | --- |
| REPRINT | 12.248 | 29 | 5 |
| CONFERENCE_PAPER | 8.570 | 20 | 58 |
| OTHER | 7.129 | 17 | 83 |
| PRESENTATION | 3.256 | 8 | 97 |
| ABSTRACT | 3.123 | 7 | 45 |
| CONTRACTOR_REPORT | 2.578 | 6 | 98 |
| TECHNICAL_MEMORANDUM | 1.251 | 3 | 99 |

REPRINT, o tipo mais comum, quase nunca tem texto completo. Os relatórios da própria NASA (CONTRACTOR_REPORT, TECHNICAL_MEMORANDUM, TECHNICAL_PUBLICATION) têm texto em quase todos os casos. PRESENTATION tem resumo mediano de 31 palavras.

## Qualidade

O resumo está presente em 96% dos documentos, mas a fonte tem inconsistências de cadastro que exigem limpeza antes de qualquer uso.

| Campo | % preenchido |
| --- | --- |
| Título, categorias, tipo, centro | 100 |
| Resumo | 96 |
| Autores e data de publicação | 96 |
| Arquivo para download | 54 |
| Palavras-chave | 24 |

Problemas encontrados:

- A mesma categoria aparece com grafias diferentes ("And" e "and"). O filtro da API diferencia as duas.
- Nomes de autores não são padronizados ("Cucinotta, F. A." e "Cucinotta, Francis A.").
- Códigos de centro que não são centros: `CDMS` (53%) e `2230`.
- Um ano de publicação inválido (992). O campo `created` registra a carga no sistema, não a publicação.
- Cerca de 5.700 resumos têm menos de 20 palavras.
- Palavras-chave em só 24% dos registros, insuficiente para mapear temas.

## Temas

Parte relevante do recorte não trata de saúde humana. A modelagem de tópicos (TF-IDF e NMF, 15 tópicos, 35.112 resumos com 30 ou mais palavras) separa três grupos:

| Grupo | Tópicos | Origem provável |
| --- | --- | --- |
| Saúde humana | Exercício e cardiovascular, perda óssea, dose de radiação, enjoo de movimento, saúde da tripulação em missões | Aerospace Medicine, Behavioral Sciences |
| Engenharia e sistemas | Controle, desempenho e software (o maior tópico, com 7.902 documentos), suporte de vida e água | Man/System |
| Fora do escopo | Astrofísica (raios cósmicos, raios X e gama, vento solar), biologia celular, crescimento de plantas | Space Radiation, Life Sciences |

O tópico de saúde da tripulação em missões ganha peso nas décadas recentes, enquanto astrofísica perde.

## Indicadores do desafio

Cerca de 75% dos documentos não mencionam nenhum dos indicadores do desafio. O núcleo útil (algum indicador, publicado desde 2000, com texto completo) tem 2.629 documentos.

| Indicador | Documentos desde 2000 com texto completo |
| --- | --- |
| Radiação | 1.497 |
| Osso | 467 |
| Músculo | 316 |
| Humor e comportamento | 257 |
| Pressão arterial | 223 |
| Sono | 221 |
| Frequência cardíaca | 143 |
| Glicemia | 40 |
| Temperatura corporal | 35 |

Os indicadores foram os exemplos do statement (pressão arterial, frequência cardíaca, glicemia, temperatura, sono, humor) mais osso, músculo e radiação. Radiação domina por causa da categoria Space Radiation. Um documento pode citar vários indicadores.

## Valores numéricos e limiares

Só 2% dos resumos trazem números com unidades dos indicadores, e a maior parte não se refere ao indicador. Com filtro de contexto restam 211 documentos.

A extração bruta aceita qualquer número seguido da unidade. A contextual exige um termo do indicador por perto (ex.: mmHg perto de *blood pressure* ou *systolic*).

| Unidade | Indicador | Ocorrências (bruta) | Ocorrências (contextual) | % mantido |
| --- | --- | --- | --- | --- |
| mmHg | Pressão arterial | 725 | 155 | 21 |
| mGy/Gy | Radiação | 462 | 12 | 3 |
| °C | Temperatura corporal | 410 | 20 | 5 |
| bpm | Frequência cardíaca | 139 | 110 | 79 |
| mSv/Sv | Radiação | 52 | 29 | 56 |
| %/mês | Osso e músculo | 19 | 17 | 89 |
| mg/dL | Glicemia | 19 | 11 | 58 |
| h/noite | Sono | 6 | 6 | 100 |

O que o filtro removeu: mmHg de pressão de CO2 e pressão intraocular, °C de temperatura ambiente e de experimentos, Gy de doses aplicadas em laboratório. Taxas de perda óssea (0,5 a 2% ao mês) e horas de sono (4 a 6 h por noite) já vinham no contexto certo.

Dos 211 candidatos, 78% são estudos em humanos, 12% em animais, 1% em células, 7% mistos e 2% sem sujeito identificado. Os casos com animais se concentram em pressão arterial (14 de 100) e frequência cardíaca (8 de 65). Glicemia tem só 5 candidatos, 2 deles em humanos.

No texto completo de 237 documentos, os valores contextualizados passam de 84 para 297. O ganho se concentra em 44 documentos, principalmente nos Evidence Reports do Human Research Program (ex.: *Risk of Ionizing Radiation Carcinogenesis*, *Risk of Cardiovascular Disease*). Radiação é o indicador que mais ganha, de 16 para 122 valores.

## Limitações

- **Sujeito da medida:** a classificação em humano, animal ou células é feita por termos e pode errar. "Human" aparece em textos sobre modelos animais, e os casos mistos precisam de leitura.
- **Valores relativos:** um valor perto do termo certo pode ser uma diferença ("aumento de 8 bpm"), não uma faixa de referência.
- **Busca por termos:** a cobertura dos indicadores depende das expressões usadas. Sinônimos não incluídos ficam de fora.
- **Tópicos:** a numeração e a composição dos tópicos podem variar entre versões do scikit-learn.
- **Texto completo:** analisado só nos 237 documentos baixados, não no corpus inteiro.
- **Recorte:** documentos de saúde classificados em outras categorias (ex.: Lunar and Planetary Exploration) não foram coletados.

## Implicações possíveis

O NTRS funciona como base de evidências sobre riscos à saúde, não como fonte de dados de saúde de astronautas. Os pontos abaixo são opções para a decisão do grupo, não recomendações fechadas.

- **Dados de saúde:** o NTRS não traz medições individuais de astronautas. Se a solução precisar de sinais vitais, eles terão de ser simulados ou vir de outra fonte.
- **Escolha de indicadores:** a cobertura por indicador pode justificar quais monitorar. Radiação, osso, músculo e pressão arterial têm base ampla. Temperatura corporal e glicemia têm pouca.
- **Limiares:** os Evidence Reports do HRP concentram os valores mais úteis encontrados. Fora dos dados, a norma NASA-STD-3001 é uma fonte de limites oficiais a verificar.
- **Explicações com fonte:** se a solução citar documentos, o corpus precisaria de filtro por sujeito (humano, animal, células) e de remoção dos temas fora do escopo.
- **Sono e humor:** quase não aparecem com valores, porque se medem por escalas e questionários. Outras fontes do Space Data Atlas, como OSDR e Life Sciences Data Archive, podem cobrir melhor.

## Arquivos

| Arquivo | Conteúdo | Onde |
| --- | --- | --- |
| `coleta_ntrs.ipynb` | Coleta das categorias pela API | Repositório |
| `eda_ntrs.ipynb` | Análise completa, com gráficos e tabelas | Repositório |
| `resultados/candidatos_limiares.csv` | 211 documentos com valores contextualizados, trechos, sujeito e pontuação | Repositório |
| `resultados/valores_extraidos.csv` | Um valor por linha, extraído dos resumos | Repositório |
| `resultados/valores_texto_completo.csv` | Um valor por linha, extraído do texto completo | Repositório |
| `ntrs_saude.parquet` | 41.866 documentos coletados (48,7 MB) | Drive, `MyDrive/space-apps-2026/ntrs` |
| `eda/textos_candidatos.json.gz` | Textos completos baixados (237 documentos) | Drive, regenerável pelo notebook |

Os notebooks leem e gravam em `MyDrive/space-apps-2026/ntrs`. Para rodar a partir do repositório, é preciso ter essa pasta no Drive ou ajustar o caminho no início de cada notebook.
