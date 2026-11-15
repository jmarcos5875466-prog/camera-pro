import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
const video=document.querySelector("#video"), hint=document.querySelector("#hint"), status=document.querySelector("#status"), panel=document.querySelector("#panel");
let stream=null, facing="environment", track=null;
async function nativeCameraTest(){
  try{
    const photo=await Camera.getPhoto({quality:90,allowEditing:false,resultType:CameraResultType.Uri,source:CameraSource.Camera,saveToGallery:true,correctOrientation:true});
    hint.hidden=false; hint.textContent="Câmera abriu e a foto foi capturada com sucesso!"; status.textContent="CÂMERA TESTADA";
    const img=document.createElement("img"); img.src=photo.webPath; img.alt="Foto de teste";
    img.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#050505";
    document.querySelector("#viewfinder").appendChild(img); setTimeout(()=>img.remove(),5000);
  }catch(e){
    if(e?.message?.toLowerCase?.().includes("cancel")) return;
    hint.hidden=false; hint.textContent="Não foi possível abrir a câmera. Verifique as permissões do Android.";
    status.textContent="FALHA NO TESTE"; console.error(e);
  }
}
async function startPreview(){
  try{
    if(stream) stream.getTracks().forEach(t=>t.stop());
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1920},height:{ideal:1080}},audio:false});
    video.srcObject=stream; track=stream.getVideoTracks()[0]; await video.play();
    hint.hidden=true; status.textContent="PRÉVIA ATIVA";
  }catch(e){hint.hidden=false;hint.textContent="Prévia ao vivo indisponível. Use o botão central para testar a câmera nativa.";status.textContent="TESTE NATIVO DISPONÍVEL";console.warn(e)}
}
document.querySelector("#start").addEventListener("click",startPreview);
document.querySelector("#switch").addEventListener("click",async()=>{facing=facing==="environment"?"user":"environment";await startPreview()});
document.querySelectorAll(".zoom").forEach(b=>b.addEventListener("click",async()=>{
  document.querySelectorAll(".zoom").forEach(x=>x.classList.toggle("active",x===b));
  const z=Number(b.dataset.zoom), caps=track?.getCapabilities?.()||{};
  if(track&&caps.zoom){try{await track.applyConstraints({advanced:[{zoom:Math.min(z,caps.zoom.max)}]})}catch{}}
  else video.style.setProperty("--zoom",z);
}));
document.querySelector("#gridToggle").addEventListener("click",()=>document.querySelector("#grid").classList.toggle("show"));
document.querySelector("#viewfinder").addEventListener("click",e=>{
  const r=e.currentTarget.getBoundingClientRect(),f=document.querySelector("#focusBox");
  f.style.left=(e.clientX-r.left)+"px";f.style.top=(e.clientY-r.top)+"px";f.classList.add("show");setTimeout(()=>f.classList.remove("show"),1200);
});
document.querySelectorAll(".modes button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".modes button").forEach(x=>x.classList.toggle("selected",x===b));
  document.querySelector("#footnote").textContent="Protótipo de teste · recursos avançados serão adicionados depois.";
}));
document.querySelector("#capture").addEventListener("click",nativeCameraTest);
function showPanel(title,html){document.querySelector("#panelTitle").textContent=title;document.querySelector("#panelContent").innerHTML=html;panel.showModal()}
document.querySelector("#settings").addEventListener("click",()=>showPanel("Teste da câmera",'<p class="note">Esta versão verifica se o Android consegue abrir a câmera nativa e salvar uma foto.</p><div class="panel-actions"><button class="primary" id="testNative">TESTAR CÂMERA</button></div>'));
document.querySelector("#look").addEventListener("click",()=>showPanel("Estilos de cor",'<p class="note">Os estilos de cor e o processamento fotográfico serão adicionados depois do teste inicial.</p>'));
document.querySelector("#timer").addEventListener("click",()=>showPanel("Temporizador",'<p class="note">Temporizador ainda não está habilitado nesta versão.</p>'));
document.querySelector("#flash").addEventListener("click",async()=>{
  if(!track){alert("Abra a prévia ao vivo primeiro.");return}
  const caps=track.getCapabilities?.()||{};if(!caps.torch){alert("Flash não suportado pela prévia.");return}
  try{await track.applyConstraints({advanced:[{torch:!track.getSettings().torch}]})}catch{alert("Não foi possível alterar o flash.")}
});
document.querySelector("#lastShot").addEventListener("click",()=>alert("A foto de teste é salva na galeria do Android."));
document.querySelector("#closePanel").addEventListener("click",()=>panel.close());
document.querySelector("#panelContent").addEventListener("click",e=>{if(e.target.id==="testNative"){panel.close();nativeCameraTest()}});
document.querySelector("#capture").setAttribute("aria-label","Testar câmera");
