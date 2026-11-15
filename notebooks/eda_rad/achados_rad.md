# EDA RAD: Radiação Espacial e Impacto na Saúde em Missão a Marte

**Hackathon NASA Space Apps — Desafio Monitor de Saúde do Astronauta**  
**Autores:** Equipe Analytica  
**Base Primária:** Mars Science Laboratory (MSL) Curiosity — Instrumento RAD (*Radiation Assessment Detector*) / NASA PDS

---

## 1. Visão Geral e Contexto da Missão

Em uma missão tripulada de ida e volta a Marte (perfil típico NASA DRA 5.0 com duração de ~860 a 1000 dias), a **radiação espacial** é o risco de saúde de nível vermelho (*Red Hazard*) mais crítico e intratável.

Diferente da Estação Espacial Internacional (ISS) — que orbita dentro da magnetosfera protetora da Terra —, uma tripulação a caminho e na superfície de Marte enfrenta duas fontes contínuas de radiação ionizante:
1. **Raios Cósmicos Galácticos (GCR):** Fundo isotrópico de partículas de altíssima energia originárias de fora do Sistema Solar (supernovas), composto predominantemente por prótons e íons pesados (núcleos HZE, ex: $^{56}\text{Fe}$, $^{28}\text{Si}$, $^{12}\text{C}$).
2. **Eventos de Partículas Solares (SPE):** Ejeções de massa coronal solar que geram fluxos súbitos de prótons de alta densidade capazes de provocar Síndrome Aguda de Radiação (ARS) sem proteção imediata.
3. **Radiação Secundária Marciana:** Interação dos GCRs com o solo (regolito) e a fina atmosfera de $\text{CO}_2$ de Marte, gerando chuveiros de **nêutrons rápidos/térmicos** e radiação gama.

---

## 2. Da Física de Partículas ao Dano Biológico (ICRP-60)

O instrumento **RAD** no rover Curiosity possui dois sensores principais:
- **Detector B (Silício):** Mede a dose física de partículas carregadas.
- **Detector E (Cintilador plástico CsI/BC-432):** Mede partículas neutras (nêutrons e gama).

### 2.1. Conversão de Gray ($\mu\text{Gy}$) para Sievert ($\mu\text{Sv}$)
A dose física absorvida ($D$ em Gray) mede apenas energia depositada por kg de massa. O impacto clínico real no corpo do astronauta depende da **Transferência Linear de Energia (LET, $L$ em $\text{keV}/\mu\text{m}$)**. 

Aplicando a função de letalidade celular da **ICRP 60**:
$$
Q(L) = \begin{cases} 
1, & L < 10\text{ keV}/\mu\text{m} \\ 
0.32 L - 2.2, & 10 \le L \le 100\text{ keV}/\mu\text{m} \\ 
\frac{300}{\sqrt{L}}, & L > 100\text{ keV}/\mu\text{m} 
\end{cases}
$$

A dose biológica equivalente horária $H$ é dada por:
$$H_{\text{total}} = (\bar{Q} \times D_B) + (w_{\text{nêutrons}} \times D_E)$$
onde $w_{\text{nêutrons}} = 10$, refletindo a altíssima eficácia biológica relativa de nêutrons secundários na indução de quebras de fita dupla de DNA (*Double-Strand Breaks*).

---

## 3. Síntese dos Dados Medidos pelo MSL RAD

| Fase da Missão | Taxa de Dose Física Absorvida | Fator Médio $\bar{Q}$ | Taxa de Dose Equivalente Biológica |
| :--- | :---: | :---: | :---: |
| **Trânsito Interplanetário (Cruise)** | $461 \pm 54\,\mu\text{Gy/dia}$ ($19.2\,\mu\text{Gy/h}$) | $\approx 3.82$ | **$1.84 \pm 0.30\,\text{mSv/dia}$** ($76.7\,\mu\text{Sv/h}$) |
| **Superfície de Marte (Gale Crater)** | $210 \pm 40\,\mu\text{Gy/dia}$ ($8.75\,\mu\text{Gy/h}$) | $\approx 3.05$ | **$0.64 \pm 0.12\,\text{mSv/dia}$** ($26.7\,\mu\text{Sv/h}$) |

### 3.1. Projeção de uma Viagem de Referência a Marte (860 dias)
- **Trânsito de Ida (180 dias):** $\approx 331\,\text{mSv}$
- **Estadia na Superfície Marciana (500 dias):** $\approx 320\,\text{mSv}$
- **Trânsito de Volta (180 dias):** $\approx 331\,\text{mSv}$
- **Dose Acumulada Total da Missão:** **$\approx 982\,\text{mSv}$ ($\approx 1.0\,\text{Sv}$)**

> [!WARNING]
> O limite de carreira estabelecido pela NASA (**NASA STD-3001**) para risco aceitável de mortalidade por câncer induzido por radiação (REID < 3%) é de **600 mSv**. Uma missão nominal a Marte **excede este limite em mais de 60%**, tornando obrigatório o monitoramento contínuo em tempo real e intervenções de radioproteção.

---

## 4. Integração com o Monitor de Saúde dos Astronautas

### 4.1. Arquitetura da Solução no Desafio
O módulo de radiação atua como o **motor de telemetria ambiental e risco preditivo**, interligado ao ecossistema clínico:

1. **Módulo Telemetria:** Lê continuamente os sensores de dosimetria da nave/habitat (MSL RAD / TEPC / Timepix).
2. **Radiation Budget Pessoal:** Cada tripulante possui um prontuário dinâmico com sua dose acumulada, permitindo escalonar turnos de atividade e priorizar quem pode realizar tarefas externas.
3. **Sinergia com os Indicadores Médicos do Desafio:**
   - **Sistema Cardiovascular:** A radiação ionizante gera espécies reativas de oxigênio (ROS), acelerando disfunção endotelial e aterogênese precoce. Interage diretamente com monitoramento de **Pressão Arterial** e **Frequência Cardíaca**.
   - **Sistema Nervoso Central (SNC):** Íons de alto LET causam neuroinflamação hipocampal, correlacionando-se com distúrbios na arquitetura do **Sono**, aumento de **Fadiga** e alterações de **Humor**.
   - **Medula Óssea e Sistema Imune:** Redução na proliferação de células hematopoiéticas (leucócitos e plaquetas), aumentando vulnerabilidade imunológica.

### 4.2. Matriz de Ação e Alertas do Monitor de Saúde

| Nível | Taxa de Dose Equivalente | Status Operacional | Ações Prescritas pelo Monitor |
| :---: | :---: | :---: | :--- |
| **🟢 VERDE** | $< 35\,\mu\text{Sv/h}$ | Operação Nominal | Exercícios contra perda óssea/muscular e EVAs na superfície marciana liberadas normalmente. |
| **🟡 AMARELO** | $35 - 100\,\mu\text{Sv/h}$ | Alerta Preventivo | Suspensão de saídas externas (EVAs) desnecessárias; recomendação de coquetel antioxidante oral (N-acetilcisteína, vitamina E, selênio). |
| **🔴 VERMELHO** | $> 100\,\mu\text{Sv/h}$ | Alerta Crítico (SPE) | **Comando de Emergência:** Recolhimento imediato de todos os astronautas ao **Storm Shelter** (área central blindada por tanques de água potável e polietileno). Monitoramento cardíaco contínuo. |

---

## 5. Estrutura de Arquivos da EDA

- `notebooks/eda_rad/data/`: Diretório de arquivos brutos PDS3 (`.LBL` e `.TXT`).
- `notebooks/eda_rad/outputs/`:
  - `rad_martian_dosimetry_clean.csv`: Tabela com doses físicas absorvidas ($D_B$, $D_E$), fator $\bar{Q}$ e dose equivalente biológica ($H$).
  - `rad_mission_radiation_budget.csv`: Série temporal simulando a evolução da dose diária acumulada nos 860 dias de missão vs. limites da NASA.
  - `dose_rates_timeline.png`: Gráfico temporal das taxas de dose físicas e biológicas.
  - `let_energy_spectrum.png`: Curva de sensibilidade biológica do Fator de Qualidade ICRP-60 vs. LET.
  - `cumulative_mission_risk.png`: Curva acumulada da missão com marcação das fases (ida, solo, volta) e limite de 600 mSv.
