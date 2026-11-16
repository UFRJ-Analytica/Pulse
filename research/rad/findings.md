# RAD EDA: Space Radiation and Health Impact on a Mars Mission

**NASA Space Apps Hackathon — Astronaut Health Monitor Challenge**  
**Authors:** Team Analytica  
**Primary source:** Mars Science Laboratory (MSL) Curiosity — RAD instrument (*Radiation Assessment Detector*) / NASA PDS

---

## 1. Overview and mission context

On a crewed round trip to Mars (typical NASA DRA 5.0 profile, ~860 to 1000 days), **space radiation** is the most critical and least tractable red-level health risk (*Red Hazard*).

Unlike the International Space Station (ISS), which orbits inside Earth's protective magnetosphere, a crew in transit to and on the surface of Mars faces continuous sources of ionizing radiation:
1. **Galactic Cosmic Rays (GCR):** an isotropic background of very high-energy particles from outside the Solar System (supernovae), mostly protons and heavy ions (HZE nuclei, e.g., $^{56}\text{Fe}$, $^{28}\text{Si}$, $^{12}\text{C}$).
2. **Solar Particle Events (SPE):** solar coronal mass ejections that produce sudden high-density proton fluxes, able to cause Acute Radiation Syndrome (ARS) without immediate shielding.
3. **Martian secondary radiation:** GCRs interacting with the ground (regolith) and the thin $\text{CO}_2$ atmosphere of Mars, producing showers of **fast/thermal neutrons** and gamma radiation.

---

## 2. From particle physics to biological damage (ICRP-60)

The **RAD** instrument on the Curiosity rover has two main sensors:
- **Detector B (silicon):** measures the physical dose of charged particles.
- **Detector E (CsI/BC-432 plastic scintillator):** measures neutral particles (neutrons and gamma).

### 2.1. Converting Gray ($\mu\text{Gy}$) to Sievert ($\mu\text{Sv}$)
The absorbed physical dose ($D$ in Gray) only measures energy deposited per kg of mass. The real clinical impact on the astronaut's body depends on the **Linear Energy Transfer (LET, $L$ in $\text{keV}/\mu\text{m}$)**.

Applying the **ICRP 60** cellular lethality function:
$$
Q(L) = \begin{cases} 
1, & L < 10\text{ keV}/\mu\text{m} \\ 
0.32 L - 2.2, & 10 \le L \le 100\text{ keV}/\mu\text{m} \\ 
\frac{300}{\sqrt{L}}, & L > 100\text{ keV}/\mu\text{m} 
\end{cases}
$$

The hourly biological equivalent dose $H$ is:
$$H_{\text{total}} = (\bar{Q} \times D_B) + (w_{\text{neutrons}} \times D_E)$$
where $w_{\text{neutrons}} = 10$, reflecting the very high relative biological effectiveness of secondary neutrons in causing DNA *double-strand breaks*.

---

## 3. Summary of MSL RAD measurements

| Mission phase | Absorbed physical dose rate | Mean factor $\bar{Q}$ | Biological equivalent dose rate |
| :--- | :---: | :---: | :---: |
| **Interplanetary transit (Cruise)** | $461 \pm 54\,\mu\text{Gy/day}$ ($19.2\,\mu\text{Gy/h}$) | $\approx 3.82$ | **$1.84 \pm 0.30\,\text{mSv/day}$** ($76.7\,\mu\text{Sv/h}$) |
| **Mars surface (Gale Crater)** | $210 \pm 40\,\mu\text{Gy/day}$ ($8.75\,\mu\text{Gy/h}$) | $\approx 3.05$ | **$0.64 \pm 0.12\,\text{mSv/day}$** ($26.7\,\mu\text{Sv/h}$) |

### 3.1. Projection for a reference Mars mission (860 days)
- **Outbound transit (180 days):** $\approx 331\,\text{mSv}$
- **Stay on the Martian surface (500 days):** $\approx 320\,\text{mSv}$
- **Return transit (180 days):** $\approx 331\,\text{mSv}$
- **Total accumulated mission dose:** **$\approx 982\,\text{mSv}$ ($\approx 1.0\,\text{Sv}$)**

> [!WARNING]
> The NASA career limit (**NASA STD-3001**) for acceptable radiation-induced cancer mortality risk (REID < 3%) is **600 mSv**. A nominal Mars mission **exceeds this limit by more than 60%**, which makes continuous real-time monitoring and radiation protection measures mandatory.

---

## 4. Integration with the astronaut Health Monitor

### 4.1. Solution architecture
The radiation module acts as the **environmental telemetry and predictive risk engine**, linked to the clinical side:

1. **Telemetry module:** continuously reads the spacecraft/habitat dosimetry sensors (MSL RAD / TEPC / Timepix).
2. **Personal radiation budget:** each crew member has a dynamic record of accumulated dose, used to schedule activity shifts and decide who can perform external tasks.
3. **Links to the challenge's medical indicators:**
   - **Cardiovascular system:** ionizing radiation produces reactive oxygen species (ROS), speeding up endothelial dysfunction and early atherogenesis. It interacts directly with **blood pressure** and **heart rate** monitoring.
   - **Central nervous system (CNS):** high-LET ions cause hippocampal neuroinflammation, correlated with disrupted **sleep** architecture, more **fatigue** and **mood** changes.
   - **Bone marrow and immune system:** lower proliferation of hematopoietic cells (leukocytes and platelets), increasing immune vulnerability.

### 4.2. Health Monitor action and alert matrix

| Level | Equivalent dose rate | Operational status | Actions prescribed by the monitor |
| :---: | :---: | :---: | :--- |
| **🟢 GREEN** | $< 35\,\mu\text{Sv/h}$ | Nominal operation | Exercise against bone/muscle loss and surface EVAs on Mars allowed as usual. |
| **🟡 YELLOW** | $35 - 100\,\mu\text{Sv/h}$ | Preventive alert | Unnecessary external activities (EVAs) suspended; oral antioxidant cocktail recommended (N-acetylcysteine, vitamin E, selenium). |
| **🔴 RED** | $> 100\,\mu\text{Sv/h}$ | Critical alert (SPE) | **Emergency command:** all astronauts move immediately to the **storm shelter** (central area shielded by drinking water tanks and polyethylene). Continuous cardiac monitoring. |

---

## 5. EDA file layout

- `research/rad/data/`: raw PDS3 files (`.LBL` and `.TXT`).
- `research/rad/outputs/`:
  - `rad_martian_dosimetry_clean.csv`: absorbed physical doses ($D_B$, $D_E$), $\bar{Q}$ factor and biological equivalent dose ($H$).
  - `rad_mission_radiation_budget.csv`: time series of the accumulated daily dose over the 860 mission days vs. NASA limits.
  - `dose_rates_timeline.png`: time chart of physical and biological dose rates.
  - `let_energy_spectrum.png`: biological sensitivity curve of the ICRP-60 quality factor vs. LET.
  - `cumulative_mission_risk.png`: accumulated mission curve with phases (outbound, surface, return) and the 600 mSv limit.
