# Portal da UEP

Portal estático em HTML, CSS e JavaScript, preparado para publicação direta pelo GitHub Pages. O projeto não exige build, backend, banco de dados ou dependências de produção.

## Estrutura

- `index.html`: página inicial.
- `blog.html` e `artigo.html`: listagem e leitura das publicações.
- `historia.html`, `diretoria.html`, `entidades.html` e `contatos.html`: páginas institucionais.
- `multimidia.html`, `jornal.html`, `carteirinha.html`, `redes.html` e `politica.html`: páginas de acervo e serviços.
- `artigos.js`: artigos e páginas institucionais importadas do acervo.
- `dados-institucionais.js`: dados estruturados da diretoria.
- `script.js`: acessibilidade, navegação, busca, blog, artigos, galeria e metadados.
- `styles.css`: sistema visual, temas e responsividade.
- `assets/`: imagens, logotipos, miniaturas e fotos.
- `jornais/`: arquivos PDF das edições do jornal.
- `tools/validate-site.ps1`: validação local de estrutura e links internos.

## Executar localmente

No PowerShell, dentro da pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Depois, abra `http://127.0.0.1:4173/`. O portal também funciona ao abrir os arquivos HTML diretamente, mas o servidor local reproduz melhor o comportamento do GitHub Pages.

## Validar

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\validate-site.ps1
```

A validação verifica páginas obrigatórias, referências locais, quantidade de artigos, scripts diferidos, ausência de `iframe` e estrutura básica de HTML e CSS.

## Publicar no GitHub Pages

1. Envie os arquivos para a raiz do repositório.
2. Em **Settings > Pages**, selecione a branch publicada e a pasta raiz.
3. Mantenha o arquivo `.nojekyll` na raiz.
4. Aguarde a conclusão da publicação e valide os caminhos pelo endereço do projeto.

O site usa caminhos relativos e não depende de configuração específica de servidor.

## Atualizar artigos

Os artigos ficam no array `window.artigosUEP`, em `artigos.js`. Preserve os campos e o formato já usados:

- `id`
- `titulo`
- `data`
- `editoria`
- `resumo`
- `corpo`
- `imagem` ou `imagens`
- `autor`, `credito` e `origem`, quando existentes

O `id` é usado na URL do artigo e não deve ser alterado depois da publicação. Textos e links são tratados pelo JavaScript antes de serem inseridos na página.

## Atualizar diretoria e páginas

- Diretoria: edite `dados-institucionais.js`, preservando a ordem e a estrutura dos grupos.
- História, Entidades e Contatos: os dados atuais ficam em `window.paginasUEP`, dentro de `artigos.js`.
- Textos específicos já presentes em uma página podem ser ajustados no HTML correspondente.

## Substituir imagens

Mantenha os nomes dos arquivos quando a intenção for apenas substituir uma imagem existente. Ao adicionar uma nova imagem ao acervo:

1. Salve o original em `assets/`.
2. Informe `width`, `height`, `loading` e `decoding` no HTML quando a imagem for estática.
3. Para a galeria, mantenha a miniatura WebP em `assets/multimidia/conune/thumbs/` e o original em `assets/multimidia/conune/`.
4. Use `data-full-src` para apontar a miniatura para o arquivo ampliado.

## Acessibilidade

O portal inclui:

- link para pular ao conteúdo;
- navegação por teclado;
- menu móvel com Escape, bloqueio de fundo e retorno de foco;
- busca e galeria em diálogos nativos;
- modo escuro;
- alto contraste;
- fonte ampliada;
- redução de movimento;
- preferências salvas no armazenamento local do navegador.

Teste as páginas com teclado, zoom, leitor de tela e nos tamanhos definidos em `styles.css`. O fluxo automático em `.github/workflows/quality.yml` executa as verificações locais a cada alteração enviada ao repositório.

## Contribuição técnica

Antes de enviar uma alteração:

1. Execute `tools/validate-site.ps1`.
2. Confira o console do navegador.
3. Teste busca, filtros, menu móvel, temas e galeria.
4. Verifique as páginas em 320, 360, 390, 430, 768, 1024 e 1440 px.
5. Não altere títulos, datas, nomes, cargos, IDs ou links editoriais sem a fonte correspondente no próprio repositório.
