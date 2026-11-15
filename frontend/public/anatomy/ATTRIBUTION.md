# Anatomia: origem, licença e adaptações

A aplicação utiliza exclusivamente geometrias reais do **Human Reference Atlas (HRA) / HuBMAP**, objeto **3D Reference Organ Set for United, Male v1.5**, publicado em 15 de dezembro de 2023. **Não utiliza BodyParts3D.** A referência local `human-atlas-main` foi consultada como referência técnica; suas malhas não foram incorporadas.

## Autoria e licença

- **Kristen Browne e Heidi Schlehlein.** *3D Reference Organ Set for Male v1.5.* 2023. [DOI: 10.48539/HBM646.RKKC.257](https://doi.org/10.48539/HBM646.RKKC.257).
- Biblioteca: Kristen Browne, Heidi Schlehlein, Bruce W. Herr II, Ellen Quardokus, Andreas Bueckle e Katy Börner. [HuBMAP CCF 3D Reference Object Library](https://humanatlas.io/3d-reference-library).
- Fonte primária: [objeto digital HRA United Male v1.5](https://purl.humanatlas.io/ref-organ/united-male/v1.5).
- Licença das geometrias e metadados: [Creative Commons Attribution 4.0 International — CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Arquivo original: [3d-vh-m-united.glb](https://cdn.humanatlas.io/digital-objects/ref-organ/united-male/v1.5/assets/3d-vh-m-united.glb).
- Metadados oficiais: [metadata.json](https://cdn.humanatlas.io/digital-objects/ref-organ/united-male/v1.5/metadata.json).
- O arquivo original deriva dos dados **Visible Human Male**, da **U.S. National Library of Medicine**, com as contribuições específicas documentadas pelo HRA. O encéfalo é proveniente do **Allen Human Reference Atlas – 3D** incorporado à referência HRA. O changelog HRA 2.0 informa a atualização da licença dessas malhas cerebrais para CC BY 4.0.
- Referência de licença da biblioteca: [portal oficial CCF](https://hubmapconsortium.github.io/ccf/pages/ccf-3d-reference-library.html); [changelog oficial HRA/CCF 2.0](https://github.com/hubmapconsortium/ccf-releases/blob/main/CHANGELOG.md).

Acesso em **5 de novembro de 2026**. A data `2026-06-08` nos metadados de distribuição identifica o processamento/republicação do objeto digital; não altera a versão anatômica de origem de dezembro de 2023. Esta implementação não implica endosso por HRA, HuBMAP, NIH, NASA ou autores.

## Adaptações na aplicação

`public/anatomy/hra-male.glb` é uma adaptação para navegação interativa:

1. As **849 malhas da fonte** foram consolidadas em **46 grupos selecionáveis** (órgãos, estruturas ou conjuntos reais). Os grupos são unidades da interface, não uma afirmação de que a anatomia possui apenas 46 estruturas. A navegação atual não seleciona independentemente cada uma das 849 malhas originais.
2. Vértices coincidentes foram unidos e as normais da fonte foram promediadas. A geometria foi simplificada com **meshoptimizer**, com limite de erro relativo de **0,3% por grupo** (limite gráfico exploratório, não garantia de precisão médica). Os **4.018.087 triângulos** originais resultaram em **456.876 triângulos**; o GLB distribuído tem **11.061.384 bytes**.
3. As coordenadas relativas originais em metros foram preservadas no GLB. O visualizador pode centralizar e normalizar a altura para 1,75 unidades de exibição. A escala é uma referência visual normalizada, não uma medida do astronauta.
4. Materiais e cores foram substituídos por uma paleta por sistema. Transparência, destaque e cortes são efeitos de visualização. O layout explodido desloca os grupos temporariamente; não altera sua posição original armazenada.
5. Rótulos dos grupos foram traduzidos para português. Identificadores UBERON/FMA vêm do `crosswalk.csv` do HRA. Sistemas e parentes originais de cada subestrutura estão preservados em `public/anatomy/manifest.json`. Os grupos sem identificador no crosswalk usam o nome de nó original, sem inventar um identificador ontológico.
6. O catálogo de navegação adiciona o nó organizacional “Corpo humano” e associa os grupos aos sistemas. `kind: ontology` indica navegação conceitual; `kind: mesh` indica geometria selecionável. Não foram geradas malhas anatômicas artificiais.

## Escopo e limitações

É uma **referência masculina**, não uma reconstrução individual nem uma representação de toda a diversidade anatômica. As estruturas disponíveis abrangem pele, encéfalo, medula, olhos, coração/vasos, pulmões/vias aéreas, fígado, pâncreas, intestinos, rins, sistema urinário, baço, timo, linfonodo, próstata e partes musculoesqueléticas.

- **Esqueleto parcial:** pelve, coluna vertebral, joelhos e hioide. Não há crânio, caixa torácica ou esqueleto completo dos membros superiores nesta versão da fonte.
- **Músculos parciais:** olhos, joelhos e laringe. Não há musculatura corporal completa.
- Não há malha de estômago nesta seleção. Nenhuma é inventada para preencher essa ausência.
- O linfonodo é um objeto de referência posicionado pela fonte; não representa um linfonodo medido da tripulação.
- Não há malhas celulares ou de tecido individual operacionalmente associadas às medições. A aplicação interrompe a navegação nesse nível e informa a ausência.
- O destaque de um sistema associado a um biomarcador é uma ajuda de navegação, não um mapa de dano, dose ou causalidade.
- A exposição é medida no ponto do dosímetro; não é dose específica do órgão. Clipping mostra cortes abertos de visualização, não tomografia ou imagem médica.

## Auditoria e reconstrução

- `public/anatomy/manifest.json`: contagens, tamanho, hashes SHA-256, fontes e relações originais de cada grupo.
- `public/anatomy/source-metadata.json`: cópia do metadado oficial consultado.
- `public/anatomy/source-crosswalk.csv`: cópia do mapeamento ontológico oficial (o arquivo de origem inclui também nós de outras referências; o catálogo usa apenas os nós existentes no GLB masculino).
- `public/anatomy/prepare-anatomy.mjs`: conversão reproduzível, usando `@gltf-transform/core` e `meshoptimizer`. Requer o GLB e o crosswalk originais; ver cabeçalho do script.
- `src/anatomy/catalog.test.ts`: verifica buffers, índices, números finitos, bounding boxes, contagem real, IDs únicos, pertencimento à hierarquia, busca e correspondência entre GLB e catálogo.

Ao redistribuir os arquivos adaptados, preserve esta atribuição, o link da licença e a indicação das alterações.
