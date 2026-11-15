/** Optional rebuild: install @gltf-transform/core and meshoptimizer in the script environment.
 * node prepare-anatomy.mjs <frontend-dir> <source.glb> <crosswalk.csv> <metadata.json>
 * Download source inputs from the URLs in ATTRIBUTION.md. Never substitutes missing anatomy.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { NodeIO, Document } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
await MeshoptSimplifier.ready;
const out = process.argv[2];
if (!out || !process.argv[3] || !process.argv[4] || !process.argv[5]) throw Error('Usage: node prepare-anatomy.mjs <frontend-dir> <source.glb> <crosswalk.csv> <metadata.json>');
const input = process.argv[3];
const io = new NodeIO();
const doc = await io.read(input);
const nodes = doc.getRoot().listNodes();
const byName = new Map(nodes.map(n=>[n.getName(),n]));
const raw=fs.readFileSync(input);const jsonLength=raw.readUInt32LE(12);const rawGltf=JSON.parse(raw.subarray(20,20+jsonLength));
if(rawGltf.nodes.some(n=>n.matrix||n.translation||n.rotation||n.scale))throw Error('Unexpected world transform');
const crosswalk=new Map(fs.readFileSync(process.argv[4],'utf8').trim().split(/\r?\n/).slice(1).map(line=>{const [name,conceptId,...label]=line.split(',');return[name,{conceptId:conceptId==='-'?null:conceptId,label:label.join(',')}]}));
const systems = [
 ['integumentary','Pele e superfície','#b7d6da','VH_M_integumentary_system','Superfície corporal masculina de referência.'],
 ['skeletal','Esqueleto e ossos','#e4dfc9','VH_M_skeletal_system','Cobertura parcial: pelve, coluna vertebral e joelhos; não representa um esqueleto completo.'],
 ['muscular','Musculoesquelético','#c18879','VH_M_muscular_system','Cobertura parcial: músculos dos olhos, joelhos e laringe.'],
 ['nervous','Sistema nervoso','#c9a9db','VH_M_nervous_system','Encéfalo, medula espinal e nervos dos olhos.'],
 ['cardiovascular','Cardiovascular e vascular','#dc8479','VH_M_circulatory_system','Coração e vasos presentes no objeto de referência.'],
 ['respiratory','Respiratório','#b7c9d9','VH_M_respiratory_system','Pulmões, laringe e árvore traqueobrônquica.'],
 ['digestive','Digestivo','#bd9274','VH_M_digestive_system','Fígado, pâncreas, vias biliares, intestinos e estruturas disponíveis. Estômago ausente nesta seleção HRA.'],
 ['urinary','Urinário','#be8b89','VH_M_urinary_system','Rins, ureteres, bexiga e uretra.'],
 ['lymphatic','Linfático e imune','#9db89a','VH_M_lymphatic_system','Baço, timo e linfonodo de referência. Linfonodo não representa localização individual medida.'],
 ['reproductive','Reprodutivo','#c2a8b2','VH_M_male_reproductive_system','Próstata e ductos genitais masculinos disponíveis.'],
];
const defs = [
 ['skin','Pele do corpo','VH_M_skin','integumentary','Corpo inteiro'],
 ['brain','Encéfalo','Allen_brain','nervous','Cabeça'],
 ['spinal-cord','Medula espinal','VH_M_spinal_cord','nervous','Coluna'],
 ['eye-nerves','Nervos dos olhos','VH_M_nerves_of_eye','nervous','Cabeça'],
 ['right-eye','Olho direito','VH_M_eye_R','nervous','Cabeça'],
 ['left-eye','Olho esquerdo','VH_M_eye_L','nervous','Cabeça'],
 ['eye-muscles','Músculos dos olhos','VH_M_muscles_of_eye','muscular','Cabeça'],
 ['knee-muscles','Músculos dos joelhos','VH_M_muscles_of_knee','muscular','Membros inferiores'],
 ['larynx-muscles','Músculos da laringe','VH_M_muscles_of_larynx','muscular','Pescoço'],
 ['genital-ducts','Ductos genitais masculinos','VH_M_male_genital_duct','reproductive','Pelve'],
 ['prostate','Próstata','VH_M_prostate_gland','reproductive','Pelve'],
 ['liver','Fígado','VH_M_liver','digestive','Abdome'],
 ['pancreas','Pâncreas','VH_M_pancreas','digestive','Abdome'],
 ['biliary-tree','Vias biliares e pancreáticas','VH_M_biliary_tree','digestive','Abdome'],
 ['small-intestine','Intestino delgado','VH_M_small_intestine','digestive','Abdome'],
 ['colon','Intestino grosso','VH_M_colon','digestive','Abdome'],
 ['gallbladder','Vesícula biliar','VH_M_gallbladder_','digestive','Abdome'],
 ['tonsils','Tonsilas palatinas','VH_M_palatine_tonsils','digestive','Cabeça'],
 ['right-ureter','Pelve renal e ureter direito','VH_M_renal_pelvis_ureter_R','urinary','Abdome'],
 ['left-ureter','Pelve renal e ureter esquerdo','VH_M_renal_pelvis_ureter_L','urinary','Abdome'],
 ['left-kidney','Rim esquerdo','VH_M_left_kidney','urinary','Abdome'],
 ['right-kidney','Rim direito','VH_M_right_kidney','urinary','Abdome'],
 ['bladder','Bexiga urinária','VH_M_urinary_bladder','urinary','Pelve'],
 ['urethra','Uretra','VH_M_urethra','urinary','Pelve'],
 ['heart','Coração','VH_M_heart','cardiovascular','Tórax'],
 ['eye-vessels','Vasos dos olhos','VH_M_blood_vasculature_of_eye','cardiovascular','Cabeça'],
 ['intestinal-vessels','Vasos do intestino grosso','VH_M_blood_vasculature_of_large_intestine','cardiovascular','Abdome'],
 ['renal-vessels','Vasos renais','VH_M_blood_vasculature_of_kidney','cardiovascular','Abdome'],
 ['cardiac-vessels','Vasos cardíacos e grandes vasos','VH_M_blood_vasculature_of_heart','cardiovascular','Tórax'],
 ['splenic-vessels','Vasos esplênicos','VH_M_blood_vasculature_of_spleen','cardiovascular','Abdome'],
 ['biliary-vessels','Vasos da vesícula biliar','VH_M_blood_vasculature_of_gall_bladder','cardiovascular','Abdome'],
 ['hepatic-vessels','Vasos hepáticos','VH_M_blood_vasculature_of_liver','cardiovascular','Abdome'],
 ['left-lung','Pulmão esquerdo','VH_M_lungs_L','respiratory','Tórax'],
 ['right-lung','Pulmão direito','VH_M_lungs_R','respiratory','Tórax'],
 ['larynx','Laringe','VH_M_larynx','respiratory','Pescoço'],
 ['airways','Árvore traqueobrônquica','VH_M_tracheobronchial_tree','respiratory','Tórax'],
 ['spleen','Baço','VH_M_spleen','lymphatic','Abdome'],
 ['lymph-node','Linfonodo de referência','Yao_lymph_node','lymphatic','Localização ilustrativa da fonte'],
 ['thymus','Timo','VH_M_thymus','lymphatic','Tórax'],
 ['pelvis','Pelve óssea','VH_M_pelvis','skeletal','Pelve'],
 ['right-knee-ligaments','Ligamentos do joelho direito','VH_M_ligaments_of_knee_R','skeletal','Membros inferiores'],
 ['left-knee-ligaments','Ligamentos do joelho esquerdo','VH_M_ligaments_of_knee_L','skeletal','Membros inferiores'],
 ['right-knee','Ossos e estruturas do joelho direito','VH_M_knee_R','skeletal','Membros inferiores'],
 ['left-knee','Ossos e estruturas do joelho esquerdo','VH_M_knee_L','skeletal','Membros inferiores'],
 ['spine','Coluna vertebral','VH_M_vertebrae','skeletal','Coluna'],
 ['hyoid','Osso hioide','VH_M_hyoid','skeletal','Pescoço'],
];
const assigned=new Set();const allEntries=[];let sourceTriangles=0,finalTriangles=0,maxError=0;
const outputDoc=new Document();const buffer=outputDoc.createBuffer();const scene=outputDoc.createScene('HRA United Male v1.5 — Pulse Health');
const base={source:'Human Reference Atlas / HuBMAP',license:'CC BY 4.0',version:'United Male v1.5 (2023)',url:'/anatomy/hra-male.glb',sourceUrl:'https://purl.humanatlas.io/ref-organ/united-male/v1.5',status:'estimated'};
const manifest=[];
for(const [id,name,sourceNode,system,region] of defs){
 const root=byName.get(sourceNode);if(!root)throw Error('Missing '+sourceNode);
 const parts=[];root.traverse(n=>{if(n.getMesh()&&!assigned.has(n)){assigned.add(n);parts.push(n)}});if(!parts.length)throw Error('Empty '+sourceNode);
 const position=[],normal=[],index=[],weld=new Map();let originalTriangles=0;
 for(const part of parts){for(const prim of part.getMesh().listPrimitives()){
  const p=prim.getAttribute('POSITION').getArray(),n=prim.getAttribute('NORMAL')?.getArray();const pi=prim.getIndices()?.getArray()??Array.from({length:p.length/3},(_,i)=>i);originalTriangles+=pi.length/3;
  const remap=new Uint32Array(p.length/3);
  for(let i=0;i<p.length;i+=3){const key=p[i]+','+p[i+1]+','+p[i+2];let k=weld.get(key);if(k===undefined){k=position.length/3;weld.set(key,k);position.push(p[i],p[i+1],p[i+2]);normal.push(0,0,0)}remap[i/3]=k;if(n){normal[k*3]+=n[i];normal[k*3+1]+=n[i+1];normal[k*3+2]+=n[i+2]}}
  for(const i of pi)index.push(remap[i]);
 }}
 const positions=new Float32Array(position),indices=new Uint32Array(index);
 const ratio = id==='skin'?.12:id.includes('eye')?.06:.10;
 const target=Math.max(180,Math.floor(indices.length*ratio/3)*3);
 const [simplified,error]=MeshoptSimplifier.simplify(indices,positions,3,Math.min(indices.length,target),.003);
 maxError=Math.max(maxError,error);const[remap,count]=MeshoptSimplifier.compactMesh(simplified);const finalPositions=new Float32Array(count*3),finalNormals=new Float32Array(count*3);
 for(let i=0;i<remap.length;i++){const k=remap[i];if(k===0xffffffff)continue;finalPositions.set(positions.subarray(i*3,i*3+3),k*3);const l=Math.hypot(normal[i*3],normal[i*3+1],normal[i*3+2])||1;finalNormals[k*3]=normal[i*3]/l;finalNormals[k*3+1]=normal[i*3+1]/l;finalNormals[k*3+2]=normal[i*3+2]/l}
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<finalPositions.length;i++){if(!Number.isFinite(finalPositions[i]))throw Error('Nonfinite');const a=i%3;min[a]=Math.min(min[a],finalPositions[i]);max[a]=Math.max(max[a],finalPositions[i])}
 for(const i of simplified)if(i>=count)throw Error('Index out of range');
 const color=systems.find(x=>x[0]===system)[2];const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
 const material=outputDoc.createMaterial(name).setBaseColorFactor([...rgb,1]).setRoughnessFactor(.7).setMetallicFactor(.05);
 const primitive=outputDoc.createPrimitive().setAttribute('POSITION',outputDoc.createAccessor().setType('VEC3').setArray(finalPositions).setBuffer(buffer)).setAttribute('NORMAL',outputDoc.createAccessor().setType('VEC3').setArray(finalNormals).setBuffer(buffer)).setIndices(outputDoc.createAccessor().setType('SCALAR').setArray(simplified).setBuffer(buffer)).setMaterial(material);
 const meshName='pulse_'+id.replaceAll('-','_');const mesh=outputDoc.createMesh(meshName).addPrimitive(primitive);const onode=outputDoc.createNode(meshName).setMesh(mesh);scene.addChild(onode);
 const sources=parts.map(p=>({node:p.getName(),parent:p.getParentNode()?.getName()??null,...(crosswalk.get(p.getName())??{}),extras:p.getExtras()}));
 const meta=crosswalk.get(sourceNode);const entry={...base,id,name,sourceId:sourceNode,parentId:system,system,region,organ:name,kind:'mesh',meshNames:[meshName],color,conceptId:meta?.conceptId??null,sourceLabel:meta?.label??sourceNode,bounds:[min,max],vertexCount:count,triangleCount:simplified.length/3,sourceStructureCount:parts.length,limitation:system==='skeletal'?'Cobertura parcial HRA: pelve, coluna e joelhos.':system==='muscular'?'Cobertura parcial HRA: olhos, joelhos e laringe.':'Malha de referência; não é a anatomia individual da tripulação.'};
 allEntries.push(entry);manifest.push({...entry,sourceStructures:sources});sourceTriangles+=originalTriangles;finalTriangles+=simplified.length/3;
 console.log(id,parts.length,originalTriangles,simplified.length/3);
}
const unassigned=nodes.filter(n=>n.getMesh()&&!assigned.has(n)).map(n=>n.getName());if(unassigned.length)console.log('UNASSIGNED',JSON.stringify(unassigned));
await io.write(out+'/public/anatomy/hra-male.glb',outputDoc);
const sourceBytes=fs.statSync(input).size,outputBytes=fs.statSync(out+'/public/anatomy/hra-male.glb').size;
const summary={sourceUrl:base.sourceUrl,downloadUrl:'https://cdn.humanatlas.io/digital-objects/ref-organ/united-male/v1.5/assets/3d-vh-m-united.glb',license:base.license,version:base.version,authors:['Kristen Browne','Heidi Schlehlein'],downloaded:'2026-11-05',sourceSHA256:crypto.createHash('sha256').update(raw).digest('hex'),outputSHA256:crypto.createHash('sha256').update(fs.readFileSync(out+'/public/anatomy/hra-male.glb')).digest('hex'),sourceMeshCount:nodes.filter(n=>n.getMesh()).length,representedSourceMeshCount:assigned.size,groupCount:allEntries.length,sourceTriangles,finalTriangles,maximumRelativeSimplificationError:maxError,sourceBytes,outputBytes,unassigned,transform:'Source meter coordinates preserved. Viewer centers x/z and translates floor y to zero, scales height to 1.75 normalized units. No per-organ repositioning.',adaptations:['Position weld, average source normals','Meshoptimizer simplification with maximum 0.3% relative error per display group','Merge source substructures into named organ display groups; original node names, ontology IDs and parents preserved in manifest','Material color replaced by system palette; no textures'],groups:manifest};
fs.writeFileSync(out+'/public/anatomy/manifest.json',JSON.stringify(summary,null,2));
fs.copyFileSync(process.argv[5],out+'/public/anatomy/source-metadata.json');
fs.copyFileSync(process.argv[4],out+'/public/anatomy/source-crosswalk.csv');
const anatomySystems=systems.map(([id,name,color,sourceId,description])=>({id,name,color,description,sourceId,conceptId:crosswalk.get(sourceId)?.conceptId??null}));
const catalog=`/** Real HRA geometry. Generated from United Male v1.5; see public/anatomy/manifest.json. */\nexport type AnatomySystemId = ${systems.map(x=>JSON.stringify(x[0])).join(' | ')};\nexport interface AnatomyNode { id: string; name: string; parentId: string | null; system: AnatomySystemId | 'body'; kind: 'mesh' | 'ontology'; sourceId: string; source: string; license: string; version: string; sourceUrl: string; url?: string; meshNames: string[]; color: string; conceptId: string | null; region: string; organ?: string; sourceLabel?: string; status: 'estimated'; bounds?: number[][]; vertexCount?: number; triangleCount?: number; sourceStructureCount?: number; limitation: string; }\nexport interface AnatomySystem { id: AnatomySystemId; name: string; color: string; description: string; sourceId: string; conceptId: string | null; }\nexport const anatomySystems: AnatomySystem[] = ${JSON.stringify(anatomySystems,null,2)};\nexport const anatomySource = ${JSON.stringify({...base,authors:summary.authors,doi:'https://doi.org/10.48539/HBM646.RKKC.257',meshCount:allEntries.length,sourceMeshCount:assigned.size,triangles:finalTriangles,bytes:outputBytes,limitation:'Atlas masculino de referência, com cobertura anatômica parcial. Geometria agrupada e simplificada para navegação; sem malha celular, sem dosimetria por órgão.'},null,2)} as const;\nexport const anatomyNodes: AnatomyNode[] = ${JSON.stringify([{...base,id:'body',name:'Corpo humano',sourceId:'VH_M',parentId:null,system:'body',kind:'ontology',meshNames:[],color:'#b7d6da',conceptId:null,region:'Corpo inteiro',limitation:'Referência masculina HRA; não é um modelo individual.'},...anatomySystems.map(s=>({...base,id:s.id,name:s.name,sourceId:s.sourceId,parentId:'body',system:s.id,kind:'ontology',meshNames:[],color:s.color,conceptId:s.conceptId,region:'Sistema',limitation:s.description})),...allEntries],null,2)};\nexport const anatomyById = new Map(anatomyNodes.map(node => [node.id, node]));\nexport function anatomyBreadcrumbs(id: string): AnatomyNode[] { const path: AnatomyNode[] = []; let node = anatomyById.get(id); const seen = new Set<string>(); while (node && !seen.has(node.id)) { path.unshift(node); seen.add(node.id); node = node.parentId ? anatomyById.get(node.parentId) : undefined; } return path; }\nexport function searchAnatomy(query: string): AnatomyNode[] { const normalize = (value: string) => value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase(); const term = normalize(query.trim()); return term ? anatomyNodes.filter(node => normalize([node.name, node.id, node.sourceId, node.conceptId, node.sourceLabel].join(' ')).includes(term)) : []; }\n`;
fs.writeFileSync(out+'/src/anatomy/catalog.ts',catalog);
console.log(JSON.stringify({...summary,groups:undefined},null,2));
