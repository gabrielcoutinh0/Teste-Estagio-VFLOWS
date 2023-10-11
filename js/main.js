class ValidaInput {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      const cnpjInput = document.getElementById("cnpj");
      const cepInput = document.getElementById("cep");
      const telefoneInput = document.getElementById("telefone");
      const enderecoInput = document.getElementById("numero");

      cnpjInput.addEventListener(
        "input",
        this.validarCNPJ.bind(this, cnpjInput)
      );

      enderecoInput.addEventListener(
        "input",
        this.validarNumeroCasa.bind(this, enderecoInput)
      );

      telefoneInput.addEventListener(
        "input",
        this.validarTelefone.bind(this, telefoneInput)
      );

      cepInput.addEventListener("input", this.validarCEP.bind(this, cepInput));
    });
  }

  validarCNPJ(cnpjInput) {
    const cnpj = cnpjInput.value.replace(/\D/g, "");

    if (cnpj.length === 14) {
      cnpjInput.value = this.formatCNPJ(cnpjInput.value);
    } else {
      cnpjInput.value = cnpj;
    }
  }

  validarNumeroCasa(enderecoInput) {
    let endereco = enderecoInput.value.trim();

    // Verifica se o endereço é "s/n" (sem número)
    if (endereco.toLowerCase() === "s/n") {
      enderecoInput.value = "s/n";
      return;
    }

    endereco = this.formatOnlyNumber(endereco);

    enderecoInput.value = endereco;
  }

  validarTelefone(telefoneInput) {
    let telefone = telefoneInput.value.trim();

    telefone = telefone.replace(/[^\d,()\-]/g, "");

    // Formata o telefone no padrão (xx) xxxx-xxxx
    if (telefone.length >= 10) telefone = this.formatTelefone(telefone);

    telefoneInput.value = telefone;
  }

  validarCEP(cepInput) {
    let cep = cepInput.value.replace(/\D/g, "");

    if (cep.length === 8) {
      cep = this.formatCEP(cep);
      cepInput.value = cep;
      this.buscarCEP(cep);
    }
  }

  async buscarCEP(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado");
      } else {
        document.getElementById("endereco").value = data.logradouro || "";
        document.getElementById("bairro").value = data.bairro || "";
        document.getElementById("municipio").value = data.localidade || "";
        document.getElementById("estado").value = data.uf || "";
      }
    } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
    }
  }

  formatCEP(cep) {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  formatTelefone(telefone) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  formatOnlyNumber(aux) {
    return aux.replace(/[^\d\s/s/n]/g, "");
  }

  formatCNPJ(cnpj) {
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
}

const dadosCadastro = new ValidaInput();

class Fornecedor {
  constructor() {
    this.produtos = [];
    this.anexos = [];
    this.proximoIndice = 0;
    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.adicionarProduto();

      document
        .getElementById("addProduto")
        .addEventListener("click", this.adicionarProduto.bind(this));
      document
        .getElementById("addAnexo")
        .addEventListener("click", this.adicionarAnexo.bind(this));

      const fornecedorForm = document.getElementById("fornecedorForm");
      fornecedorForm.addEventListener("submit", (event) => {
        event.preventDefault();

        fornecedor.enviarDados();
      });
    });
  }

  adicionarProduto() {
    const indice = this.proximoIndice++;

    this.produtos.push({
      indice: indice,
      descricao: "",
      unidade: "",
      quantidade: 0,
      valorUnitario: 0,
    });

    const novoProduto = this.criarNovoProduto(indice);
    const produtosContainer = document.getElementById("produtos");
    produtosContainer.appendChild(novoProduto);

    const removerProdutoButton = novoProduto.querySelector(".remover-produto");
    removerProdutoButton.addEventListener("click", () =>
      this.removerProduto(novoProduto)
    );

    const inputElements = novoProduto.querySelectorAll(
      'input[id^="nome-produto"], select[id^="und-medida"], input[id^="qdtde-estoque"], input[id^="valor-unitario"], input[id^="valor-total"]'
    );
    inputElements.forEach((inputElement) => {
      inputElement.addEventListener("change", () =>
        this.atualizarProduto(indice, inputElements)
      );
    });

    this.calculaValorTotal(indice);
  }

  criarNovoProduto(indice) {
    const produtoHTML = `
    <div class="fs-huge-margin-top fs-sm-margin-right">
      <button type="button" class="btn btn-danger remover-produto">
        <i class="fluigicon fluigicon-trash icon-lg" aria-hidden="true"></i>
      </button>
    </div>

    <fieldset class="fieldset-border fs-full-width">
      <legend class="fieldset-border">Produto - ${indice + 1}</legend>

      <div class="fs-display-flex fs-align-items-center">
        <figure>
          <img src="/assets/img/box.svg" title="Box" />
        </figure>
        <div class="fs-full-width">
          <div class="form-group col-md-12">
            <label for="nome-produto">Produto</label>
            <input
              type="text"
              class="form-control"
              id="nome-produto"
              required
            />
          </div>

          <div class="form-group col-md-3">
            <label for="und-medida">UND. Medida</label>
            <select class="form-control" id="und-medida" required>
              <option value="" data-default disabled selected></option>
              <option value="kg">kg</option>
              <option value="hg">hg</option>
              <option value="dag">dag</option>
              <option value="g">g</option>
              <option value="dg">dg</option>
              <option value="cg">cg</option>
              <option value="mg">mg</option>
            </select>
          </div>

          <div class="form-group col-md-3">
            <label for="qdtde-estoque-${indice}">QDTDE. em Estoque</label>
            <input
              type="number"
              class="form-control"
              id="qdtde-estoque-${indice}"
              required
            />
          </div>

          <div class="form-group col-md-3">
            <label for="valor-unitario-${indice}">Valor Unitário</label>
            <input
              type="number"
              step=0.01
              class="form-control"
              id="valor-unitario-${indice}"
              required
            />
          </div>

          <div class="form-group col-md-3">
            <label for="valor-total-${indice}">Valor Total</label>
            <input
              type="text"
              class="form-control"
              id="valor-total-${indice}"
              required
              readonly
            />
          </div>
        </div>
      </div>
    </fieldset>
  `;

    const novoProduto = document.createElement("div");
    novoProduto.classList.add("fs-display-flex");
    novoProduto.classList.add("produto");
    novoProduto.innerHTML = produtoHTML;
    return novoProduto;
  }

  removerProduto(produto) {
    const produtosContainer = document.getElementById("produtos");
    produtosContainer.removeChild(produto);
    this.produtos.splice(this, 1);
  }

  atualizarProduto(indice, inputElements) {
    const produto = this.produtos[indice];
    const descricaoInput = inputElements[0];
    const unidadeInput = inputElements[1];
    const quantidadeInput = inputElements[2];
    const valorUnitarioInput = inputElements[3];
    const valorTotalInput = inputElements[4];

    produto.descricao = descricaoInput.value;
    produto.unidade = unidadeInput.value;
    produto.quantidade = parseFloat(quantidadeInput.value);
    produto.valorUnitario = parseFloat(valorUnitarioInput.value);

    const valorTotal = produto.quantidade * produto.valorUnitario;
    produto.valorTotal = valorTotal;
    valorTotalInput.value = valorTotal;

    this.calculaValorTotal(indice);
  }

  calculaValorTotal(indice) {
    const quantidadeInput = document.getElementById(`qdtde-estoque-${indice}`);
    const valorUnitarioInput = document.getElementById(
      `valor-unitario-${indice}`
    );
    const valorTotalInput = document.getElementById(`valor-total-${indice}`);

    function atualizarValorTotal() {
      const quantidade = parseFloat(quantidadeInput.value) || 0;
      const valorUnitario = parseFloat(valorUnitarioInput.value) || 0;
      const valorTotal = (quantidade * valorUnitario).toFixed(2);
      valorTotalInput.value = valorTotal;
    }

    quantidadeInput.addEventListener("input", atualizarValorTotal);
    valorUnitarioInput.addEventListener("input", atualizarValorTotal);
  }

  adicionarAnexo() {
    const indice = this.anexos.length;

    const inputAnexo = document.createElement("input");
    inputAnexo.type = "file";
    inputAnexo.className = "form-control";
    inputAnexo.id = `anexo${indice}`;
    inputAnexo.accept = "image/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx";
    inputAnexo.style.display = "none";

    inputAnexo.addEventListener("change", (event) =>
      this.handleAnexoChange(event, indice)
    );
    document.getElementById("anexos").appendChild(inputAnexo);
    inputAnexo.click();
  }

  handleAnexoChange(event, indice) {
    if (event.target.type === "file") {
      const arquivo = event.target.files[0];
      if (arquivo) {
        const documentoBlob = new Blob([arquivo], { type: arquivo.type });
        this.anexos[indice] = {
          indice: indice,
          nome: arquivo.name,
          blob: documentoBlob,
        };
        this.atualizarListaAnexos();
      }
    }
  }

  atualizarListaAnexos() {
    const listaAnexosDiv = document.getElementById("anexos");
    listaAnexosDiv.innerHTML = "";

    this.anexos.forEach((documento, indice) => {
      const anexoItem = this.criarAnexoItem(documento, indice);
      listaAnexosDiv.appendChild(anexoItem);
    });
  }

  criarAnexoItem(documento, indice) {
    const anexoItem = document.createElement("div");
    anexoItem.classList.add("mb-3");
    anexoItem.classList.add("fs-md-padding-top");

    const visualizarButton = this.criarBotao(
      `<i class="fluigicon fluigicon-eye-open icon-lg" aria-hidden="true"></i>`,
      "btn-info fs-sm-margin-right",
      () => this.visualizarAnexo(indice)
    );
    const removerButton = this.criarBotao(
      `<i class="fluigicon fluigicon-trash icon-lg" aria-hidden="true"></i>`,
      "btn-danger",
      () => this.removerAnexo(indice)
    );

    const documentoLink = this.criarDocumentoLink(documento.nome);

    anexoItem.appendChild(visualizarButton);
    anexoItem.appendChild(removerButton);
    anexoItem.appendChild(documentoLink);

    return anexoItem;
  }

  criarBotao(texto, classe, clickHandler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn ${classe}`;
    button.addEventListener("click", clickHandler);
    button.innerHTML = `
      ${texto}
    `;
    return button;
  }

  criarDocumentoLink(nome) {
    const documentoLink = document.createElement("span");
    documentoLink.className = "fs-lg-padding-left";
    documentoLink.id = "documentoLink";
    documentoLink.textContent = nome;
    return documentoLink;
  }

  removerAnexo(indice) {
    this.anexos.splice(indice, 1);
    this.atualizarListaAnexos();
  }

  visualizarAnexo = (indice) => {
    const documento = this.anexos[indice];
    const link = document.createElement("a");
    link.href = documento.link;
    link.download = documento.nome;
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  enviarDados() {
    const razaoSocialInput = document.getElementById("razaoSocial");
    const nomeFantasiaInput = document.getElementById("nomeFantasia");
    const cnpjInput = document.getElementById("cnpj");
    const nomeContatoInput = document.getElementById("contato");
    const telefoneContatoInput = document.getElementById("telefone");
    const emailContatoInput = document.getElementById("email");
    const inscricaoEstadualInput = document.getElementById("inscricaoEstadual");
    const inscricaoMunicipalInput = document.getElementById("inscricaoMunicipal");

    const dadosFornecedor = {
      razaoSocial: razaoSocialInput.value,
      nomeFantasia: nomeFantasiaInput.value,
      cnpj: cnpjInput.value,
      inscricaoEstadual: inscricaoEstadualInput.value,
      inscricaoMunicipal: inscricaoMunicipalInput.value,
      nomeContato: nomeContatoInput.value,
      telefoneContato: telefoneContatoInput.value,
      emailContato: emailContatoInput.value,
      produtos: this.produtos,
      anexos: this.anexos,
    };

    const jsonString = JSON.stringify(dadosFornecedor);
    const blob = new Blob([jsonString], { type: "application/json" });
    const blobURL = URL.createObjectURL(blob);
    const delay = 1000;

    if (
      dadosFornecedor.anexos.length >= 1 &&
      dadosFornecedor.produtos.length >= 1
    ) {
      setTimeout(() => {
        const downloadLink = document.createElement("a");
        downloadLink.href = blobURL;
        downloadLink.download = "dados.json";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);
        console.log(dadosFornecedor);
      }, delay);

      return doneModal();
    } else if (dadosFornecedor.anexos.length === 0) {
      alert("Por favor, anexe pelo menos 1 arquivo.");
      return;
    }
  }
}

const fornecedor = new Fornecedor();

const modal = document.getElementById("modal");
const modalContent = document.getElementById("content");

function abrirModal() {
  modal.style.display = "block";
}

const fecharModalERemover = (children = null) => {
  modal.style.display = "none";

  modalContent.removeChild(children);
};

const fecharModalButton = document.getElementById("fecharModal");

function doneModal() {
  const animation = document.createElement("div");
  animation.classList.add("spinner");
  modalContent.style.height = "500px";

  modalContent.appendChild(animation);
  abrirModal();

  setTimeout(() => {
    animation.classList.remove("spinner");
    animation.classList.add("check");

    const checkIcon = document.createElement("i");
    checkIcon.classList.add("fluigicon");
    checkIcon.classList.add("fluigicon-verified");
    checkIcon.classList.add("icon-thumbnail-md");
    checkIcon.setAttribute("aria-hidden", "true");

    const successText = document.createElement("p");
    successText.textContent = "Dados enviados com sucesso!";
    const okButton = fornecedor.criarBotao("Ok", "btn-success", () =>
      fecharModalERemover(animation)
    );

    animation.appendChild(checkIcon);
    animation.appendChild(successText);
    animation.appendChild(okButton);
  }, 1000);

  fecharModalButton.addEventListener("click", () => {
    fecharModalERemover(animation);
  });
}
