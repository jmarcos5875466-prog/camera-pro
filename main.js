import { registerPlugin } from "@capacitor/core";

const NativeCamera = registerPlugin("NativeCamera");
const video = document.querySelector("#video");
const hint = document.querySelector("#hint");
const status = document.querySelector("#status");
const panel = document.querySelector("#panel");

let stream = null;
let facing = "environment";
let track = null;
let isCapturing = false;
let lastPhotoUrl = null;

async function startPreview() {
  try {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    });
    video.srcObject = stream;
    track = stream.getVideoTracks()[0];
    await video.play();
    hint.hidden = true;
    status.textContent = facing === "environment" ? "CÂMERA TRASEIRA" : "CÂMERA FRONTAL";
    document.querySelector("#start").textContent = "●";
    document.querySelector("#footnote").textContent = "Toque no obturador para fotografar";
  } catch (e) {
    hint.hidden = false;
    hint.textContent = "Não foi possível abrir a câmera. Verifique a permissão de câmera do Android.";
    status.textContent = "CÂMERA INDISPONÍVEL";
    console.error(e);
  }
}

async function capturePhoto() {
  if (isCapturing) return;
  isCapturing = true;
  const shutter = document.querySelector("#capture");
  shutter.classList.add("capturing");
  try {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null; track = null; video.srcObject = null;
    }
    status.textContent = "CAPTURANDO EM ALTA RESOLUÇÃO...";
    const result = await NativeCamera.captureHighestResolution();
    const width = result.width || 0, height = result.height || 0;
    const mp = result.megapixels || (width * height / 1000000);
    status.textContent = "FOTO SALVA";
    hint.hidden = false;
    hint.textContent = `Foto salva na galeria: ${width} × ${height} (${mp.toFixed(1)} MP)`;
    document.querySelector("#footnote").textContent = `Última foto: ${width} × ${height} · ${mp.toFixed(1)} MP`;
  } catch (e) {
    console.error(e);
    status.textContent = "FALHA NA CAPTURA";
    hint.hidden = false;
    hint.textContent = `Não foi possível capturar em alta resolução: ${e.message || e}`;
  } finally {
    isCapturing = false;
    shutter.classList.remove("capturing");
    await startPreview();
  }
}


function showCapturedPhoto(url) {
  if (lastPhotoUrl) URL.revokeObjectURL(lastPhotoUrl);
  lastPhotoUrl = url;
  const img = document.createElement("img");
  img.src = url;
  img.alt = "Última foto capturada";
  img.className = "captured-preview";
  img.addEventListener("click", () => img.remove());
  document.querySelectorAll(".captured-preview").forEach(old => old.remove());
  document.querySelector("#viewfinder").appendChild(img);
  setTimeout(() => img.remove(), 3500);
}

document.querySelector("#start").addEventListener("click", startPreview);
document.querySelector("#capture").addEventListener("click", capturePhoto);

document.querySelector("#switch").addEventListener("click", async () => {
  facing = facing === "environment" ? "user" : "environment";
  await startPreview();
});

document.querySelectorAll(".zoom").forEach(button => button.addEventListener("click", async () => {
  const z = Number(button.dataset.zoom);
  document.querySelectorAll(".zoom").forEach(b => b.classList.toggle("active", b === button));
  const caps = track?.getCapabilities?.() || {};
  if (track && caps.zoom) {
    try { await track.applyConstraints({ advanced: [{ zoom: Math.min(z, caps.zoom.max) }] }); }
    catch { video.style.setProperty("--zoom", z); }
  } else {
    video.style.setProperty("--zoom", z);
  }
}));

document.querySelector("#gridToggle").addEventListener("click", () => {
  document.querySelector("#grid").classList.toggle("show");
});

document.querySelector("#viewfinder").addEventListener("click", event => {
  const rect = event.currentTarget.getBoundingClientRect();
  const box = document.querySelector("#focusBox");
  box.style.left = `${event.clientX - rect.left}px`;
  box.style.top = `${event.clientY - rect.top}px`;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 1200);
});

document.querySelectorAll(".modes button").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".modes button").forEach(b => b.classList.toggle("selected", b === button));
  const mode = button.dataset.mode;
  document.querySelector("#footnote").textContent =
    mode === "RETRATO" ? "Modo retrato avançado será desenvolvido na próxima etapa." :
    mode === "VÍDEO" || mode === "CINEMA" ? "Gravação de vídeo será integrada na próxima etapa." :
    "Modo de teste: captura integrada à prévia.";
}));

function showPanel(title, html) {
  document.querySelector("#panelTitle").textContent = title;
  document.querySelector("#panelContent").innerHTML = html;
  panel.showModal();
}

document.querySelector("#settings").addEventListener("click", () => showPanel("Camera Pro 0.2", `
  <p class="note">O obturador usa a API Camera2 do Android para capturar na maior resolução JPEG anunciada pela câmera traseira.</p>
  <p class="note">Para fotografar, primeiro abra a prévia pelo botão de câmera e depois toque no obturador central.</p>
`));

document.querySelector("#look").addEventListener("click", () => showPanel("Estilos de cor", `
  <p class="note">Os perfis de cor e o processamento fotográfico serão adicionados após validar a captura integrada.</p>
`));

document.querySelector("#timer").addEventListener("click", () => showPanel("Temporizador", `
  <p class="note">Temporizador ainda não está habilitado nesta versão.</p>
`));

document.querySelector("#flash").addEventListener("click", async () => {
  if (!track) { alert("Abra a prévia da câmera primeiro."); return; }
  const caps = track.getCapabilities?.() || {};
  if (!caps.torch) { alert("Flash contínuo não está disponível nesta prévia."); return; }
  try { await track.applyConstraints({ advanced: [{ torch: !track.getSettings().torch }] }); }
  catch { alert("Não foi possível alterar o flash."); }
});

document.querySelector("#lastShot").addEventListener("click", () => {
  if (lastPhotoUrl) {
    const win = window.open(lastPhotoUrl, "_blank");
    if (!win) alert("A última foto foi salva na galeria do celular.");
  } else {
    alert("As fotos capturadas ficam salvas na galeria do Android.");
  }
});

document.querySelector("#closePanel").addEventListener("click", () => panel.close());
document.querySelector("#panelContent").addEventListener("click", () => {});
