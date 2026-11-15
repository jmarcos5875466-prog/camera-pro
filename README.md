# Camera Pro — protótipo inicial

Aplicativo de câmera com interface inspirada na experiência minimalista do iPhone, preparado para evoluir para Android nativo.

## O que esta versão já demonstra
- Interface responsiva para celular.
- Prévia ao vivo usando `getUserMedia`.
- Alternância entre câmera frontal e traseira.
- Captura de foto e gravação de vídeo quando suportadas pelo navegador/WebView.
- Zoom quando o dispositivo expõe essa capacidade.
- Grade, ponto de foco visual e painéis de ajustes demonstrativos.

## Limitações importantes
Esta é a **primeira etapa de interface/protótipo**, não uma GCam nem uma câmera nativa completa. Os controles de exposição, balanço de branco, HDR computacional, segmentação de pessoa para desfoque de fundo e estabilização avançada ainda não estão implementados. CSS/HTML sozinho não consegue garantir esses recursos.

Para a versão final, integrar uma camada Android nativa com CameraX/Camera2, validar os recursos efetivamente expostos pelo Realme 15T e implementar processamento de imagem/vídeo. Não é possível prometer qualidade idêntica à de um iPhone ou ativar recursos que o sensor/driver não disponibilize.

## Executar no computador
Requer Node.js LTS e Android Studio para gerar o APK.

```bash
npm install
npm run start
```

## Preparar Android
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
No Android Studio, aguarde a sincronização do Gradle e gere o APK pelo menu Build > Build Bundle(s) / APK(s) > Build APK(s).

## Próxima etapa técnica
1. Substituir a captura WebView por prévia nativa CameraX.
2. Adicionar permissões de câmera/microfone e salvamento em MediaStore.
3. Expor zoom, foco, exposição, flash e FPS conforme `CameraCharacteristics`.
4. Criar pipeline de foto: HDR/bracketing quando suportado, redução de ruído, nitidez e cor.
5. Implementar segmentação de pessoa para retrato e avaliar desfoque em tempo real para vídeo.
6. Testar no Realme 15T físico; a disponibilidade depende do firmware e das câmeras.

\n## Gerar APK automaticamente pelo GitHub
1. Crie um repositório GitHub vazio chamado `camera-pro`.
2. Envie todos os arquivos deste ZIP para a raiz do repositório, incluindo a pasta oculta `.github`.
3. Abra a aba **Actions** e aguarde `Build Camera Pro APK`.
4. Abra a execução concluída e baixe `camera-pro-debug-apk` em **Artifacts**.
5. Extraia o ZIP do Artifact e instale `app-debug.apk` no Android.

O workflow gera um APK de depuração. O botão central usa o plugin oficial Capacitor Camera para abrir a interface nativa de captura do Android e salvar uma foto de teste.


## Camera Pro 0.2 — captura integrada
O obturador agora captura um frame diretamente do elemento de prévia (`video`) usando canvas. O workflow injeta um plugin Android `GallerySaver` que grava o JPEG na galeria usando `MediaStore`, sem abrir o aplicativo de câmera externo. O arquivo fica em `Pictures/Camera Pro`.
