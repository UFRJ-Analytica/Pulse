/** Real HRA geometry. Generated from United Male v1.5; see public/anatomy/manifest.json. */
export type AnatomySystemId = "integumentary" | "skeletal" | "muscular" | "nervous" | "cardiovascular" | "respiratory" | "digestive" | "urinary" | "lymphatic" | "reproductive";
export interface AnatomyNode { id: string; name: string; parentId: string | null; system: AnatomySystemId | 'body'; kind: 'mesh' | 'ontology'; sourceId: string; source: string; license: string; version: string; sourceUrl: string; url?: string; meshNames: string[]; color: string; conceptId: string | null; region: string; organ?: string; sourceLabel?: string; status: 'estimated'; bounds?: number[][]; vertexCount?: number; triangleCount?: number; sourceStructureCount?: number; limitation: string; }
export interface AnatomySystem { id: AnatomySystemId; name: string; color: string; description: string; sourceId: string; conceptId: string | null; }
export const anatomySystems: AnatomySystem[] = [
  {
    "id": "integumentary",
    "name": "Pele e superfície",
    "color": "#b7d6da",
    "description": "Superfície corporal masculina de referência.",
    "sourceId": "VH_M_integumentary_system",
    "conceptId": "UBERON:0013754"
  },
  {
    "id": "skeletal",
    "name": "Esqueleto e ossos",
    "color": "#e4dfc9",
    "description": "Cobertura parcial: pelve, coluna vertebral e joelhos; não representa um esqueleto completo.",
    "sourceId": "VH_M_skeletal_system",
    "conceptId": "UBERON:0001434"
  },
  {
    "id": "muscular",
    "name": "Musculoesquelético",
    "color": "#c18879",
    "description": "Cobertura parcial: músculos dos olhos, joelhos e laringe.",
    "sourceId": "VH_M_muscular_system",
    "conceptId": "UBERON:0001630"
  },
  {
    "id": "nervous",
    "name": "Sistema nervoso",
    "color": "#c9a9db",
    "description": "Encéfalo, medula espinal e nervos dos olhos.",
    "sourceId": "VH_M_nervous_system",
    "conceptId": "UBERON:0001017"
  },
  {
    "id": "cardiovascular",
    "name": "Cardiovascular e vascular",
    "color": "#dc8479",
    "description": "Coração e vasos presentes no objeto de referência.",
    "sourceId": "VH_M_circulatory_system",
    "conceptId": "UBERON:0001009"
  },
  {
    "id": "respiratory",
    "name": "Respiratório",
    "color": "#b7c9d9",
    "description": "Pulmões, laringe e árvore traqueobrônquica.",
    "sourceId": "VH_M_respiratory_system",
    "conceptId": "UBERON:0001004"
  },
  {
    "id": "digestive",
    "name": "Digestivo",
    "color": "#bd9274",
    "description": "Fígado, pâncreas, vias biliares, intestinos e estruturas disponíveis. Estômago ausente nesta seleção HRA.",
    "sourceId": "VH_M_digestive_system",
    "conceptId": "UBERON:0001007"
  },
  {
    "id": "urinary",
    "name": "Urinário",
    "color": "#be8b89",
    "description": "Rins, ureteres, bexiga e uretra.",
    "sourceId": "VH_M_urinary_system",
    "conceptId": "UBERON:0001008"
  },
  {
    "id": "lymphatic",
    "name": "Linfático e imune",
    "color": "#9db89a",
    "description": "Baço, timo e linfonodo de referência. Linfonodo não representa localização individual medida.",
    "sourceId": "VH_M_lymphatic_system",
    "conceptId": "UBERON:0002465"
  },
  {
    "id": "reproductive",
    "name": "Reprodutivo",
    "color": "#c2a8b2",
    "description": "Próstata e ductos genitais masculinos disponíveis.",
    "sourceId": "VH_M_male_reproductive_system",
    "conceptId": "UBERON:0000079"
  }
];
export const anatomySource = {
  "source": "Human Reference Atlas / HuBMAP",
  "license": "CC BY 4.0",
  "version": "United Male v1.5 (2023)",
  "url": "/anatomy/hra-male.glb",
  "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
  "status": "estimated",
  "authors": [
    "Kristen Browne",
    "Heidi Schlehlein"
  ],
  "doi": "https://doi.org/10.48539/HBM646.RKKC.257",
  "meshCount": 46,
  "sourceMeshCount": 849,
  "triangles": 456876,
  "bytes": 11061384,
  "limitation": "Atlas masculino de referência, com cobertura anatômica parcial. Geometria agrupada e simplificada para navegação; sem malha celular, sem dosimetria por órgão."
} as const;
export const anatomyNodes: AnatomyNode[] = [
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "body",
    "name": "Corpo humano",
    "sourceId": "VH_M",
    "parentId": null,
    "system": "body",
    "kind": "ontology",
    "meshNames": [],
    "color": "#b7d6da",
    "conceptId": null,
    "region": "Corpo inteiro",
    "limitation": "Referência masculina HRA; não é um modelo individual."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "integumentary",
    "name": "Pele e superfície",
    "sourceId": "VH_M_integumentary_system",
    "parentId": "body",
    "system": "integumentary",
    "kind": "ontology",
    "meshNames": [],
    "color": "#b7d6da",
    "conceptId": "UBERON:0013754",
    "region": "Sistema",
    "limitation": "Superfície corporal masculina de referência."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "skeletal",
    "name": "Esqueleto e ossos",
    "sourceId": "VH_M_skeletal_system",
    "parentId": "body",
    "system": "skeletal",
    "kind": "ontology",
    "meshNames": [],
    "color": "#e4dfc9",
    "conceptId": "UBERON:0001434",
    "region": "Sistema",
    "limitation": "Cobertura parcial: pelve, coluna vertebral e joelhos; não representa um esqueleto completo."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "muscular",
    "name": "Musculoesquelético",
    "sourceId": "VH_M_muscular_system",
    "parentId": "body",
    "system": "muscular",
    "kind": "ontology",
    "meshNames": [],
    "color": "#c18879",
    "conceptId": "UBERON:0001630",
    "region": "Sistema",
    "limitation": "Cobertura parcial: músculos dos olhos, joelhos e laringe."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "nervous",
    "name": "Sistema nervoso",
    "sourceId": "VH_M_nervous_system",
    "parentId": "body",
    "system": "nervous",
    "kind": "ontology",
    "meshNames": [],
    "color": "#c9a9db",
    "conceptId": "UBERON:0001017",
    "region": "Sistema",
    "limitation": "Encéfalo, medula espinal e nervos dos olhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "cardiovascular",
    "name": "Cardiovascular e vascular",
    "sourceId": "VH_M_circulatory_system",
    "parentId": "body",
    "system": "cardiovascular",
    "kind": "ontology",
    "meshNames": [],
    "color": "#dc8479",
    "conceptId": "UBERON:0001009",
    "region": "Sistema",
    "limitation": "Coração e vasos presentes no objeto de referência."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "respiratory",
    "name": "Respiratório",
    "sourceId": "VH_M_respiratory_system",
    "parentId": "body",
    "system": "respiratory",
    "kind": "ontology",
    "meshNames": [],
    "color": "#b7c9d9",
    "conceptId": "UBERON:0001004",
    "region": "Sistema",
    "limitation": "Pulmões, laringe e árvore traqueobrônquica."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "digestive",
    "name": "Digestivo",
    "sourceId": "VH_M_digestive_system",
    "parentId": "body",
    "system": "digestive",
    "kind": "ontology",
    "meshNames": [],
    "color": "#bd9274",
    "conceptId": "UBERON:0001007",
    "region": "Sistema",
    "limitation": "Fígado, pâncreas, vias biliares, intestinos e estruturas disponíveis. Estômago ausente nesta seleção HRA."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "urinary",
    "name": "Urinário",
    "sourceId": "VH_M_urinary_system",
    "parentId": "body",
    "system": "urinary",
    "kind": "ontology",
    "meshNames": [],
    "color": "#be8b89",
    "conceptId": "UBERON:0001008",
    "region": "Sistema",
    "limitation": "Rins, ureteres, bexiga e uretra."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "lymphatic",
    "name": "Linfático e imune",
    "sourceId": "VH_M_lymphatic_system",
    "parentId": "body",
    "system": "lymphatic",
    "kind": "ontology",
    "meshNames": [],
    "color": "#9db89a",
    "conceptId": "UBERON:0002465",
    "region": "Sistema",
    "limitation": "Baço, timo e linfonodo de referência. Linfonodo não representa localização individual medida."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "reproductive",
    "name": "Reprodutivo",
    "sourceId": "VH_M_male_reproductive_system",
    "parentId": "body",
    "system": "reproductive",
    "kind": "ontology",
    "meshNames": [],
    "color": "#c2a8b2",
    "conceptId": "UBERON:0000079",
    "region": "Sistema",
    "limitation": "Próstata e ductos genitais masculinos disponíveis."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "skin",
    "name": "Pele do corpo",
    "sourceId": "VH_M_skin",
    "parentId": "integumentary",
    "system": "integumentary",
    "region": "Corpo inteiro",
    "organ": "Pele do corpo",
    "kind": "mesh",
    "meshNames": [
      "pulse_skin"
    ],
    "color": "#b7d6da",
    "conceptId": "UBERON:0002097",
    "sourceLabel": "skin of body",
    "bounds": [
      [
        -0.5236384272575378,
        -0.9145138263702393,
        -0.16059337556362152
      ],
      [
        0.522952675819397,
        0.9148719310760498,
        0.15549874305725098
      ]
    ],
    "vertexCount": 11120,
    "triangleCount": 22236,
    "sourceStructureCount": 1,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "brain",
    "name": "Encéfalo",
    "sourceId": "Allen_brain",
    "parentId": "nervous",
    "system": "nervous",
    "region": "Cabeça",
    "organ": "Encéfalo",
    "kind": "mesh",
    "meshNames": [
      "pulse_brain"
    ],
    "color": "#c9a9db",
    "conceptId": "UBERON:0000955",
    "sourceLabel": "brain",
    "bounds": [
      [
        -0.06821044534444809,
        0.756519079208374,
        -0.08457446843385696
      ],
      [
        0.0680290013551712,
        0.9025253057479858,
        0.08227424323558807
      ]
    ],
    "vertexCount": 51095,
    "triangleCount": 101573,
    "sourceStructureCount": 283,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "spinal-cord",
    "name": "Medula espinal",
    "sourceId": "VH_M_spinal_cord",
    "parentId": "nervous",
    "system": "nervous",
    "region": "Coluna",
    "organ": "Medula espinal",
    "kind": "mesh",
    "meshNames": [
      "pulse_spinal_cord"
    ],
    "color": "#c9a9db",
    "conceptId": "UBERON:0002240",
    "sourceLabel": "spinal cord",
    "bounds": [
      [
        -0.013561515137553215,
        0.28457602858543396,
        -0.0815236046910286
      ],
      [
        0.007147521711885929,
        0.7496684193611145,
        -0.0020661354064941406
      ]
    ],
    "vertexCount": 1375,
    "triangleCount": 1635,
    "sourceStructureCount": 30,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "eye-nerves",
    "name": "Nervos dos olhos",
    "sourceId": "VH_M_nerves_of_eye",
    "parentId": "nervous",
    "system": "nervous",
    "region": "Cabeça",
    "organ": "Nervos dos olhos",
    "kind": "mesh",
    "meshNames": [
      "pulse_eye_nerves"
    ],
    "color": "#c9a9db",
    "conceptId": null,
    "sourceLabel": "VH_M_nerves_of_eye",
    "bounds": [
      [
        -0.032652709633111954,
        0.8057531714439392,
        0.03138389065861702
      ],
      [
        0.03448187932372093,
        0.8143205046653748,
        0.07384024560451508
      ]
    ],
    "vertexCount": 1711,
    "triangleCount": 3484,
    "sourceStructureCount": 4,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "right-eye",
    "name": "Olho direito",
    "sourceId": "VH_M_eye_R",
    "parentId": "nervous",
    "system": "nervous",
    "region": "Cabeça",
    "organ": "Olho direito",
    "kind": "mesh",
    "meshNames": [
      "pulse_right_eye"
    ],
    "color": "#c9a9db",
    "conceptId": "UBERON:0004549",
    "sourceLabel": "right eye",
    "bounds": [
      [
        -0.04688456282019615,
        0.7986962795257568,
        0.07138314098119736
      ],
      [
        -0.02249758690595627,
        0.8230668306350708,
        0.09710761159658432
      ]
    ],
    "vertexCount": 11107,
    "triangleCount": 20770,
    "sourceStructureCount": 23,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "left-eye",
    "name": "Olho esquerdo",
    "sourceId": "VH_M_eye_L",
    "parentId": "nervous",
    "system": "nervous",
    "region": "Cabeça",
    "organ": "Olho esquerdo",
    "kind": "mesh",
    "meshNames": [
      "pulse_left_eye"
    ],
    "color": "#c9a9db",
    "conceptId": "UBERON:0004548",
    "sourceLabel": "left eye",
    "bounds": [
      [
        0.024252530187368393,
        0.7980583310127258,
        0.07125939428806305
      ],
      [
        0.04869353026151657,
        0.8224703669548035,
        0.09698816388845444
      ]
    ],
    "vertexCount": 11078,
    "triangleCount": 20762,
    "sourceStructureCount": 23,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "eye-muscles",
    "name": "Músculos dos olhos",
    "sourceId": "VH_M_muscles_of_eye",
    "parentId": "muscular",
    "system": "muscular",
    "region": "Cabeça",
    "organ": "Músculos dos olhos",
    "kind": "mesh",
    "meshNames": [
      "pulse_eye_muscles"
    ],
    "color": "#c18879",
    "conceptId": "UBERON:0004277",
    "sourceLabel": "eye muscle",
    "bounds": [
      [
        -0.047879450023174286,
        0.7954787015914917,
        0.042944807559251785
      ],
      [
        0.049712199717760086,
        0.825488269329071,
        0.09110065549612045
      ]
    ],
    "vertexCount": 2584,
    "triangleCount": 5120,
    "sourceStructureCount": 12,
    "limitation": "Cobertura parcial HRA: olhos, joelhos e laringe."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "knee-muscles",
    "name": "Músculos dos joelhos",
    "sourceId": "VH_M_muscles_of_knee",
    "parentId": "muscular",
    "system": "muscular",
    "region": "Membros inferiores",
    "organ": "Músculos dos joelhos",
    "kind": "mesh",
    "meshNames": [
      "pulse_knee_muscles"
    ],
    "color": "#c18879",
    "conceptId": null,
    "sourceLabel": "VH_M_muscles_of_knee",
    "bounds": [
      [
        -0.16185705363750458,
        -0.3754648268222809,
        0.021906379610300064
      ],
      [
        0.16711360216140747,
        0.08061223477125168,
        0.09787605702877045
      ]
    ],
    "vertexCount": 406,
    "triangleCount": 804,
    "sourceStructureCount": 4,
    "limitation": "Cobertura parcial HRA: olhos, joelhos e laringe."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "larynx-muscles",
    "name": "Músculos da laringe",
    "sourceId": "VH_M_muscles_of_larynx",
    "parentId": "muscular",
    "system": "muscular",
    "region": "Pescoço",
    "organ": "Músculos da laringe",
    "kind": "mesh",
    "meshNames": [
      "pulse_larynx_muscles"
    ],
    "color": "#c18879",
    "conceptId": "UBERON:0001568",
    "sourceLabel": "muscle of larynx",
    "bounds": [
      [
        -0.019889697432518005,
        0.6297280192375183,
        0.02207520231604576
      ],
      [
        0.016574954614043236,
        0.6925191879272461,
        0.05716641619801521
      ]
    ],
    "vertexCount": 1656,
    "triangleCount": 3260,
    "sourceStructureCount": 11,
    "limitation": "Cobertura parcial HRA: olhos, joelhos e laringe."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "genital-ducts",
    "name": "Ductos genitais masculinos",
    "sourceId": "VH_M_male_genital_duct",
    "parentId": "reproductive",
    "system": "reproductive",
    "region": "Pelve",
    "organ": "Ductos genitais masculinos",
    "kind": "mesh",
    "meshNames": [
      "pulse_genital_ducts"
    ],
    "color": "#c2a8b2",
    "conceptId": "UBERON:0010140",
    "sourceLabel": "male genital duct",
    "bounds": [
      [
        -0.05416858568787575,
        -0.098521389067173,
        -0.04260385036468506
      ],
      [
        0.06250491738319397,
        0.07688498497009277,
        0.0803460106253624
      ]
    ],
    "vertexCount": 4544,
    "triangleCount": 9034,
    "sourceStructureCount": 4,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "prostate",
    "name": "Próstata",
    "sourceId": "VH_M_prostate_gland",
    "parentId": "reproductive",
    "system": "reproductive",
    "region": "Pelve",
    "organ": "Próstata",
    "kind": "mesh",
    "meshNames": [
      "pulse_prostate"
    ],
    "color": "#c2a8b2",
    "conceptId": "UBERON:0002367",
    "sourceLabel": "prostate gland",
    "bounds": [
      [
        -0.014382077381014824,
        -0.008280419744551182,
        -0.030344823375344276
      ],
      [
        0.015216710045933723,
        0.02754627726972103,
        0.0002448272716719657
      ]
    ],
    "vertexCount": 7178,
    "triangleCount": 14018,
    "sourceStructureCount": 14,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "liver",
    "name": "Fígado",
    "sourceId": "VH_M_liver",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Abdome",
    "organ": "Fígado",
    "kind": "mesh",
    "meshNames": [
      "pulse_liver"
    ],
    "color": "#bd9274",
    "conceptId": "UBERON:0002107",
    "sourceLabel": "liver",
    "bounds": [
      [
        -0.13321492075920105,
        0.27997711300849915,
        -0.08957931399345398
      ],
      [
        0.05809805914759636,
        0.45434147119522095,
        0.11217745393514633
      ]
    ],
    "vertexCount": 3409,
    "triangleCount": 6654,
    "sourceStructureCount": 26,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "pancreas",
    "name": "Pâncreas",
    "sourceId": "VH_M_pancreas",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Abdome",
    "organ": "Pâncreas",
    "kind": "mesh",
    "meshNames": [
      "pulse_pancreas"
    ],
    "color": "#bd9274",
    "conceptId": "UBERON:0001264",
    "sourceLabel": "Pancreas",
    "bounds": [
      [
        -0.03404233232140541,
        0.3036598861217499,
        -0.03250398114323616
      ],
      [
        0.0772932767868042,
        0.37559881806373596,
        0.051097992807626724
      ]
    ],
    "vertexCount": 1984,
    "triangleCount": 3893,
    "sourceStructureCount": 5,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "biliary-tree",
    "name": "Vias biliares e pancreáticas",
    "sourceId": "VH_M_biliary_tree",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Abdome",
    "organ": "Vias biliares e pancreáticas",
    "kind": "mesh",
    "meshNames": [
      "pulse_biliary_tree"
    ],
    "color": "#bd9274",
    "conceptId": "UBERON:0001173",
    "sourceLabel": "biliary tree",
    "bounds": [
      [
        -0.06178142502903938,
        0.30713164806365967,
        -0.021428154781460762
      ],
      [
        0.07166226953268051,
        0.389719694852829,
        0.04468884319067001
      ]
    ],
    "vertexCount": 1546,
    "triangleCount": 3091,
    "sourceStructureCount": 8,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "small-intestine",
    "name": "Intestino delgado",
    "sourceId": "VH_M_small_intestine",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Abdome",
    "organ": "Intestino delgado",
    "kind": "mesh",
    "meshNames": [
      "pulse_small_intestine"
    ],
    "color": "#bd9274",
    "conceptId": "UBERON:0002108",
    "sourceLabel": "small intestine",
    "bounds": [
      [
        -0.06174842640757561,
        0.09983012825250626,
        0.001969575881958008
      ],
      [
        0.12570586800575256,
        0.3652014136314392,
        0.12413256615400314
      ]
    ],
    "vertexCount": 4756,
    "triangleCount": 9473,
    "sourceStructureCount": 10,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "colon",
    "name": "Intestino grosso",
    "sourceId": "VH_M_colon",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Abdome",
    "organ": "Intestino grosso",
    "kind": "mesh",
    "meshNames": [
      "pulse_colon"
    ],
    "color": "#bd9274",
    "conceptId": "UBERON:0000059",
    "sourceLabel": "large intestine",
    "bounds": [
      [
        -0.11607681959867477,
        -0.038275640457868576,
        -0.08586498349905014
      ],
      [
        0.1430491805076599,
        0.4114046096801758,
        0.13897916674613953
      ]
    ],
    "vertexCount": 3645,
    "triangleCount": 8257,
    "sourceStructureCount": 10,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "gallbladder",
    "name": "Vesícula biliar",
    "sourceId": "VH_M_gallbladder_",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Abdome",
    "organ": "Vesícula biliar",
    "kind": "mesh",
    "meshNames": [
      "pulse_gallbladder"
    ],
    "color": "#bd9274",
    "conceptId": null,
    "sourceLabel": "VH_M_gallbladder_",
    "bounds": [
      [
        -0.09709583222866058,
        0.3309827446937561,
        0.02141488902270794
      ],
      [
        -0.054750870913267136,
        0.3727317750453949,
        0.09420215338468552
      ]
    ],
    "vertexCount": 518,
    "triangleCount": 1032,
    "sourceStructureCount": 1,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "tonsils",
    "name": "Tonsilas palatinas",
    "sourceId": "VH_M_palatine_tonsils",
    "parentId": "digestive",
    "system": "digestive",
    "region": "Cabeça",
    "organ": "Tonsilas palatinas",
    "kind": "mesh",
    "meshNames": [
      "pulse_tonsils"
    ],
    "color": "#bd9274",
    "conceptId": "UBERON:0002373",
    "sourceLabel": "palatine tonsil",
    "bounds": [
      [
        -0.024523509666323662,
        0.7281761169433594,
        0.047397393733263016
      ],
      [
        0.021663622930645943,
        0.7524650692939758,
        0.06332562118768692
      ]
    ],
    "vertexCount": 1476,
    "triangleCount": 2944,
    "sourceStructureCount": 2,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "right-ureter",
    "name": "Pelve renal e ureter direito",
    "sourceId": "VH_M_renal_pelvis_ureter_R",
    "parentId": "urinary",
    "system": "urinary",
    "region": "Abdome",
    "organ": "Pelve renal e ureter direito",
    "kind": "mesh",
    "meshNames": [
      "pulse_right_ureter"
    ],
    "color": "#be8b89",
    "conceptId": null,
    "sourceLabel": "VH_M_renal_pelvis_ureter_R",
    "bounds": [
      [
        -0.07052703201770782,
        0.044791582971811295,
        -0.027383875101804733
      ],
      [
        -0.011769367381930351,
        0.3143630921840668,
        0.03140882030129433
      ]
    ],
    "vertexCount": 1446,
    "triangleCount": 2840,
    "sourceStructureCount": 13,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "left-ureter",
    "name": "Pelve renal e ureter esquerdo",
    "sourceId": "VH_M_renal_pelvis_ureter_L",
    "parentId": "urinary",
    "system": "urinary",
    "region": "Abdome",
    "organ": "Pelve renal e ureter esquerdo",
    "kind": "mesh",
    "meshNames": [
      "pulse_left_ureter"
    ],
    "color": "#be8b89",
    "conceptId": null,
    "sourceLabel": "VH_M_renal_pelvis_ureter_L",
    "bounds": [
      [
        0.01825220137834549,
        0.03731853514909744,
        -0.042892783880233765
      ],
      [
        0.08359541743993759,
        0.3311534523963928,
        0.026951322332024574
      ]
    ],
    "vertexCount": 1556,
    "triangleCount": 3060,
    "sourceStructureCount": 14,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "left-kidney",
    "name": "Rim esquerdo",
    "sourceId": "VH_M_left_kidney",
    "parentId": "urinary",
    "system": "urinary",
    "region": "Abdome",
    "organ": "Rim esquerdo",
    "kind": "mesh",
    "meshNames": [
      "pulse_left_kidney"
    ],
    "color": "#be8b89",
    "conceptId": "UBERON:0004538",
    "sourceLabel": "left kidney",
    "bounds": [
      [
        0.03372572734951973,
        0.24982765316963196,
        -0.06865017116069794
      ],
      [
        0.10943610966205597,
        0.35637569427490234,
        0.01363122183829546
      ]
    ],
    "vertexCount": 5393,
    "triangleCount": 10786,
    "sourceStructureCount": 22,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "right-kidney",
    "name": "Rim direito",
    "sourceId": "VH_M_right_kidney",
    "parentId": "urinary",
    "system": "urinary",
    "region": "Abdome",
    "organ": "Rim direito",
    "kind": "mesh",
    "meshNames": [
      "pulse_right_kidney"
    ],
    "color": "#be8b89",
    "conceptId": "UBERON:0004539",
    "sourceLabel": "right kidney",
    "bounds": [
      [
        -0.09693148732185364,
        0.22901256382465363,
        -0.05117791146039963
      ],
      [
        -0.03157129883766174,
        0.34147486090660095,
        0.02490798383951187
      ]
    ],
    "vertexCount": 4419,
    "triangleCount": 8912,
    "sourceStructureCount": 24,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "bladder",
    "name": "Bexiga urinária",
    "sourceId": "VH_M_urinary_bladder",
    "parentId": "urinary",
    "system": "urinary",
    "region": "Pelve",
    "organ": "Bexiga urinária",
    "kind": "mesh",
    "meshNames": [
      "pulse_bladder"
    ],
    "color": "#be8b89",
    "conceptId": "UBERON:0001255",
    "sourceLabel": "urinary bladder",
    "bounds": [
      [
        -0.036822739988565445,
        0.010487528517842293,
        -0.017449405044317245
      ],
      [
        0.026911411434412003,
        0.05030447989702225,
        0.054864414036273956
      ]
    ],
    "vertexCount": 868,
    "triangleCount": 1639,
    "sourceStructureCount": 6,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "urethra",
    "name": "Uretra",
    "sourceId": "VH_M_urethra",
    "parentId": "urinary",
    "system": "urinary",
    "region": "Pelve",
    "organ": "Uretra",
    "kind": "mesh",
    "meshNames": [
      "pulse_urethra"
    ],
    "color": "#be8b89",
    "conceptId": null,
    "sourceLabel": "VH_M_urethra",
    "bounds": [
      [
        -0.005612348206341267,
        -0.10905518382787704,
        -0.015272576361894608
      ],
      [
        0.011977170594036579,
        0.01757725514471531,
        0.1115981861948967
      ]
    ],
    "vertexCount": 294,
    "triangleCount": 541,
    "sourceStructureCount": 2,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "heart",
    "name": "Coração",
    "sourceId": "VH_M_heart",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Tórax",
    "organ": "Coração",
    "kind": "mesh",
    "meshNames": [
      "pulse_heart"
    ],
    "color": "#dc8479",
    "conceptId": "UBERON:0000948",
    "sourceLabel": "heart",
    "bounds": [
      [
        -0.04338120296597481,
        0.4234910011291504,
        -0.015010504052042961
      ],
      [
        0.08087196201086044,
        0.5287841558456421,
        0.0901692733168602
      ]
    ],
    "vertexCount": 8083,
    "triangleCount": 16410,
    "sourceStructureCount": 14,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "eye-vessels",
    "name": "Vasos dos olhos",
    "sourceId": "VH_M_blood_vasculature_of_eye",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Cabeça",
    "organ": "Vasos dos olhos",
    "kind": "mesh",
    "meshNames": [
      "pulse_eye_vessels"
    ],
    "color": "#dc8479",
    "conceptId": "UBERON:0002203",
    "sourceLabel": "vasculature of eye",
    "bounds": [
      [
        -0.04085954278707504,
        0.7958563566207886,
        0.042442403733730316
      ],
      [
        0.0426664762198925,
        0.828786313533783,
        0.0969102680683136
      ]
    ],
    "vertexCount": 4832,
    "triangleCount": 9180,
    "sourceStructureCount": 14,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "intestinal-vessels",
    "name": "Vasos do intestino grosso",
    "sourceId": "VH_M_blood_vasculature_of_large_intestine",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Abdome",
    "organ": "Vasos do intestino grosso",
    "kind": "mesh",
    "meshNames": [
      "pulse_intestinal_vessels"
    ],
    "color": "#dc8479",
    "conceptId": null,
    "sourceLabel": "VH_M_blood_vasculature_of_large_intestine",
    "bounds": [
      [
        -0.05421986058354378,
        -0.04303272068500519,
        -0.09030236303806305
      ],
      [
        0.07864628732204437,
        0.36446884274482727,
        0.07266806811094284
      ]
    ],
    "vertexCount": 3825,
    "triangleCount": 7178,
    "sourceStructureCount": 32,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "renal-vessels",
    "name": "Vasos renais",
    "sourceId": "VH_M_blood_vasculature_of_kidney",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Abdome",
    "organ": "Vasos renais",
    "kind": "mesh",
    "meshNames": [
      "pulse_renal_vessels"
    ],
    "color": "#dc8479",
    "conceptId": null,
    "sourceLabel": "VH_M_blood_vasculature_of_kidney",
    "bounds": [
      [
        -0.0620170533657074,
        0.2928638458251953,
        -0.020405031740665436
      ],
      [
        0.06087846681475639,
        0.31485575437545776,
        0.023980068042874336
      ]
    ],
    "vertexCount": 320,
    "triangleCount": 525,
    "sourceStructureCount": 4,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "cardiac-vessels",
    "name": "Vasos cardíacos e grandes vasos",
    "sourceId": "VH_M_blood_vasculature_of_heart",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Tórax",
    "organ": "Vasos cardíacos e grandes vasos",
    "kind": "mesh",
    "meshNames": [
      "pulse_cardiac_vessels"
    ],
    "color": "#dc8479",
    "conceptId": null,
    "sourceLabel": "VH_M_blood_vasculature_of_heart",
    "bounds": [
      [
        -0.050985343754291534,
        0.16888031363487244,
        -0.038526590913534164
      ],
      [
        0.07916996628046036,
        0.6829797029495239,
        0.08710365742444992
      ]
    ],
    "vertexCount": 7811,
    "triangleCount": 15348,
    "sourceStructureCount": 37,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "splenic-vessels",
    "name": "Vasos esplênicos",
    "sourceId": "VH_M_blood_vasculature_of_spleen",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Abdome",
    "organ": "Vasos esplênicos",
    "kind": "mesh",
    "meshNames": [
      "pulse_splenic_vessels"
    ],
    "color": "#dc8479",
    "conceptId": null,
    "sourceLabel": "VH_M_blood_vasculature_of_spleen",
    "bounds": [
      [
        -0.00014194846153259277,
        0.33159512281417847,
        -0.055492423474788666
      ],
      [
        0.12431102246046066,
        0.4223674237728119,
        0.039572201669216156
      ]
    ],
    "vertexCount": 847,
    "triangleCount": 1608,
    "sourceStructureCount": 2,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "biliary-vessels",
    "name": "Vasos da vesícula biliar",
    "sourceId": "VH_M_blood_vasculature_of_gall_bladder",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Abdome",
    "organ": "Vasos da vesícula biliar",
    "kind": "mesh",
    "meshNames": [
      "pulse_biliary_vessels"
    ],
    "color": "#dc8479",
    "conceptId": null,
    "sourceLabel": "VH_M_blood_vasculature_of_gall_bladder",
    "bounds": [
      [
        -0.06595486402511597,
        0.3580222725868225,
        0.016003085300326347
      ],
      [
        -0.042450714856386185,
        0.3681795299053192,
        0.05447464808821678
      ]
    ],
    "vertexCount": 155,
    "triangleCount": 280,
    "sourceStructureCount": 2,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "hepatic-vessels",
    "name": "Vasos hepáticos",
    "sourceId": "VH_M_blood_vasculature_of_liver",
    "parentId": "cardiovascular",
    "system": "cardiovascular",
    "region": "Abdome",
    "organ": "Vasos hepáticos",
    "kind": "mesh",
    "meshNames": [
      "pulse_hepatic_vessels"
    ],
    "color": "#dc8479",
    "conceptId": null,
    "sourceLabel": "VH_M_blood_vasculature_of_liver",
    "bounds": [
      [
        -0.11188790202140808,
        0.324457049369812,
        -0.019389662891626358
      ],
      [
        0.023084605112671852,
        0.4274007976055145,
        0.09130386263132095
      ]
    ],
    "vertexCount": 934,
    "triangleCount": 1604,
    "sourceStructureCount": 15,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "left-lung",
    "name": "Pulmão esquerdo",
    "sourceId": "VH_M_lungs_L",
    "parentId": "respiratory",
    "system": "respiratory",
    "region": "Tórax",
    "organ": "Pulmão esquerdo",
    "kind": "mesh",
    "meshNames": [
      "pulse_left_lung"
    ],
    "color": "#b7c9d9",
    "conceptId": "UBERON:0002168",
    "sourceLabel": "left lung",
    "bounds": [
      [
        0.004425945226103067,
        0.39407211542129517,
        -0.09099474549293518
      ],
      [
        0.13413237035274506,
        0.6147493124008179,
        0.09747371822595596
      ]
    ],
    "vertexCount": 1107,
    "triangleCount": 2693,
    "sourceStructureCount": 13,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "right-lung",
    "name": "Pulmão direito",
    "sourceId": "VH_M_lungs_R",
    "parentId": "respiratory",
    "system": "respiratory",
    "region": "Tórax",
    "organ": "Pulmão direito",
    "kind": "mesh",
    "meshNames": [
      "pulse_right_lung"
    ],
    "color": "#b7c9d9",
    "conceptId": "UBERON:0002167",
    "sourceLabel": "right lung",
    "bounds": [
      [
        -0.12497565895318985,
        0.38561198115348816,
        -0.09223982691764832
      ],
      [
        -0.0014046287396922708,
        0.6128024458885193,
        0.09729213267564774
      ]
    ],
    "vertexCount": 1103,
    "triangleCount": 2569,
    "sourceStructureCount": 14,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "larynx",
    "name": "Laringe",
    "sourceId": "VH_M_larynx",
    "parentId": "respiratory",
    "system": "respiratory",
    "region": "Pescoço",
    "organ": "Laringe",
    "kind": "mesh",
    "meshNames": [
      "pulse_larynx"
    ],
    "color": "#b7c9d9",
    "conceptId": "UBERON:0001737",
    "sourceLabel": "larynx",
    "bounds": [
      [
        -0.028447207063436508,
        0.6275649070739746,
        0.021755971014499664
      ],
      [
        0.02530587464570999,
        0.7001882791519165,
        0.060335882008075714
      ]
    ],
    "vertexCount": 1216,
    "triangleCount": 2408,
    "sourceStructureCount": 7,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "airways",
    "name": "Árvore traqueobrônquica",
    "sourceId": "VH_M_tracheobronchial_tree",
    "parentId": "respiratory",
    "system": "respiratory",
    "region": "Tórax",
    "organ": "Árvore traqueobrônquica",
    "kind": "mesh",
    "meshNames": [
      "pulse_airways"
    ],
    "color": "#b7c9d9",
    "conceptId": "\"UBERON:0007196 \"",
    "sourceLabel": "tracheobronchial tree",
    "bounds": [
      [
        -0.10999953001737595,
        0.417999804019928,
        -0.07874483615159988
      ],
      [
        0.11763390153646469,
        0.6600753664970398,
        0.061779942363500595
      ]
    ],
    "vertexCount": 14420,
    "triangleCount": 25465,
    "sourceStructureCount": 38,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "spleen",
    "name": "Baço",
    "sourceId": "VH_M_spleen",
    "parentId": "lymphatic",
    "system": "lymphatic",
    "region": "Abdome",
    "organ": "Baço",
    "kind": "mesh",
    "meshNames": [
      "pulse_spleen"
    ],
    "color": "#9db89a",
    "conceptId": "UBERON:0002106",
    "sourceLabel": "spleen",
    "bounds": [
      [
        0.025887958705425262,
        0.3108134865760803,
        -0.08054957538843155
      ],
      [
        0.13624580204486847,
        0.4293825030326843,
        0.00779232382774353
      ]
    ],
    "vertexCount": 845,
    "triangleCount": 1686,
    "sourceStructureCount": 5,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "lymph-node",
    "name": "Linfonodo de referência",
    "sourceId": "Yao_lymph_node",
    "parentId": "lymphatic",
    "system": "lymphatic",
    "region": "Localização ilustrativa da fonte",
    "organ": "Linfonodo de referência",
    "kind": "mesh",
    "meshNames": [
      "pulse_lymph_node"
    ],
    "color": "#9db89a",
    "conceptId": "UBERON:0002509",
    "sourceLabel": "mesenteric lymph node",
    "bounds": [
      [
        -0.010047435760498047,
        0.32302844524383545,
        0.06508777290582657
      ],
      [
        0.008258800022304058,
        0.33368533849716187,
        0.0780453011393547
      ]
    ],
    "vertexCount": 27952,
    "triangleCount": 57641,
    "sourceStructureCount": 7,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "thymus",
    "name": "Timo",
    "sourceId": "VH_M_thymus",
    "parentId": "lymphatic",
    "system": "lymphatic",
    "region": "Tórax",
    "organ": "Timo",
    "kind": "mesh",
    "meshNames": [
      "pulse_thymus"
    ],
    "color": "#9db89a",
    "conceptId": "UBERON:0002370",
    "sourceLabel": "thymus",
    "bounds": [
      [
        -0.026719531044363976,
        0.5001791715621948,
        0.025759853422641754
      ],
      [
        0.010233096778392792,
        0.5758303999900818,
        0.06082838028669357
      ]
    ],
    "vertexCount": 363,
    "triangleCount": 741,
    "sourceStructureCount": 2,
    "limitation": "Malha de referência; não é a anatomia individual da tripulação."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "pelvis",
    "name": "Pelve óssea",
    "sourceId": "VH_M_pelvis",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Pelve",
    "organ": "Pelve óssea",
    "kind": "mesh",
    "meshNames": [
      "pulse_pelvis"
    ],
    "color": "#e4dfc9",
    "conceptId": "UBERON:0001270",
    "sourceLabel": "bony pelvis",
    "bounds": [
      [
        -0.13641799986362457,
        -0.03468357026576996,
        -0.11866570264101028
      ],
      [
        0.1467696875333786,
        0.18336085975170135,
        0.05371488630771637
      ]
    ],
    "vertexCount": 2716,
    "triangleCount": 7386,
    "sourceStructureCount": 14,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "right-knee-ligaments",
    "name": "Ligamentos do joelho direito",
    "sourceId": "VH_M_ligaments_of_knee_R",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Membros inferiores",
    "organ": "Ligamentos do joelho direito",
    "kind": "mesh",
    "meshNames": [
      "pulse_right_knee_ligaments"
    ],
    "color": "#e4dfc9",
    "conceptId": null,
    "sourceLabel": "VH_M_ligaments_of_knee_R",
    "bounds": [
      [
        -0.19411128759384155,
        -0.4931187629699707,
        -0.04387679323554039
      ],
      [
        -0.08464539051055908,
        -0.3784744143486023,
        0.04781389981508255
      ]
    ],
    "vertexCount": 260,
    "triangleCount": 496,
    "sourceStructureCount": 6,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "left-knee-ligaments",
    "name": "Ligamentos do joelho esquerdo",
    "sourceId": "VH_M_ligaments_of_knee_L",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Membros inferiores",
    "organ": "Ligamentos do joelho esquerdo",
    "kind": "mesh",
    "meshNames": [
      "pulse_left_knee_ligaments"
    ],
    "color": "#e4dfc9",
    "conceptId": null,
    "sourceLabel": "VH_M_ligaments_of_knee_L",
    "bounds": [
      [
        0.08990196138620377,
        -0.4942658245563507,
        -0.04765123128890991
      ],
      [
        0.19936782121658325,
        -0.3796214163303375,
        0.044084690511226654
      ]
    ],
    "vertexCount": 260,
    "triangleCount": 496,
    "sourceStructureCount": 6,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "right-knee",
    "name": "Ossos e estruturas do joelho direito",
    "sourceId": "VH_M_knee_R",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Membros inferiores",
    "organ": "Ossos e estruturas do joelho direito",
    "kind": "mesh",
    "meshNames": [
      "pulse_right_knee"
    ],
    "color": "#e4dfc9",
    "conceptId": "FMA:24977",
    "sourceLabel": "Right knee",
    "bounds": [
      [
        -0.23798733949661255,
        -0.8321632146835327,
        -0.10919098556041718
      ],
      [
        -0.06485103815793991,
        0.055143531411886215,
        0.05468800291419029
      ]
    ],
    "vertexCount": 1156,
    "triangleCount": 2288,
    "sourceStructureCount": 20,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "left-knee",
    "name": "Ossos e estruturas do joelho esquerdo",
    "sourceId": "VH_M_knee_L",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Membros inferiores",
    "organ": "Ossos e estruturas do joelho esquerdo",
    "kind": "mesh",
    "meshNames": [
      "pulse_left_knee"
    ],
    "color": "#e4dfc9",
    "conceptId": "FMA:24978",
    "sourceLabel": "Left knee",
    "bounds": [
      [
        0.07000496238470078,
        -0.8333102464675903,
        -0.1129654124379158
      ],
      [
        0.24303296208381653,
        0.05399654805660248,
        0.05091357231140137
      ]
    ],
    "vertexCount": 1156,
    "triangleCount": 2288,
    "sourceStructureCount": 20,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "spine",
    "name": "Coluna vertebral",
    "sourceId": "VH_M_vertebrae",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Coluna",
    "organ": "Coluna vertebral",
    "kind": "mesh",
    "meshNames": [
      "pulse_spine"
    ],
    "color": "#e4dfc9",
    "conceptId": null,
    "sourceLabel": "VH_M_vertebrae",
    "bounds": [
      [
        -0.049466054886579514,
        0.14710524678230286,
        -0.11609729379415512
      ],
      [
        0.05992015823721886,
        0.7618608474731445,
        0.01808241754770279
      ]
    ],
    "vertexCount": 15992,
    "triangleCount": 32044,
    "sourceStructureCount": 24,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  },
  {
    "source": "Human Reference Atlas / HuBMAP",
    "license": "CC BY 4.0",
    "version": "United Male v1.5 (2023)",
    "url": "/anatomy/hra-male.glb",
    "sourceUrl": "https://purl.humanatlas.io/ref-organ/united-male/v1.5",
    "status": "estimated",
    "id": "hyoid",
    "name": "Osso hioide",
    "sourceId": "VH_M_hyoid",
    "parentId": "skeletal",
    "system": "skeletal",
    "region": "Pescoço",
    "organ": "Osso hioide",
    "kind": "mesh",
    "meshNames": [
      "pulse_hyoid"
    ],
    "color": "#e4dfc9",
    "conceptId": "UBERON:0001685",
    "sourceLabel": "hyoid bone",
    "bounds": [
      [
        -0.030425889417529106,
        0.6808578372001648,
        0.024464700371026993
      ],
      [
        0.024003751575946808,
        0.6925805807113647,
        0.057674963027238846
      ]
    ],
    "vertexCount": 364,
    "triangleCount": 724,
    "sourceStructureCount": 1,
    "limitation": "Cobertura parcial HRA: pelve, coluna e joelhos."
  }
];
export const anatomyById = new Map(anatomyNodes.map(node => [node.id, node]));
export function anatomyBreadcrumbs(id: string): AnatomyNode[] { const path: AnatomyNode[] = []; let node = anatomyById.get(id); const seen = new Set<string>(); while (node && !seen.has(node.id)) { path.unshift(node); seen.add(node.id); node = node.parentId ? anatomyById.get(node.parentId) : undefined; } return path; }
export function searchAnatomy(query: string): AnatomyNode[] { const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); const term = normalize(query.trim()); return term ? anatomyNodes.filter(node => normalize([node.name, node.id, node.sourceId, node.conceptId, node.sourceLabel].join(' ')).includes(term)) : []; }
