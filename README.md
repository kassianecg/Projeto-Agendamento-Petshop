# 🐾 Mundo Pet — Sistema de Agendamento

Aplicação web de agendamento para petshop, permitindo visualizar, criar e cancelar atendimentos organizados por período do dia (manhã, tarde e noite).

---

## 📋 Funcionalidades

- **Visualizar agenda do dia** — ao abrir a aplicação, os agendamentos do dia atual são carregados automaticamente.
- **Filtro por data** — selecione qualquer data para visualizar os atendimentos daquele dia.
- **Novo agendamento** — modal com formulário completo para cadastrar um novo atendimento.
- **Cancelar agendamento** — botão de remoção em cada card de atendimento.
- **Organização por período** — agendamentos exibidos em três seções:
  - ☀️ **Manhã** — 09h às 12h
  - ☁️ **Tarde** — 13h às 18h
  - 🌙 **Noite** — 19h às 21h
- **Validação de formulário em tempo real** — erros exibidos por campo ao sair do input ou ao digitar após um erro.
- **Máscara de telefone** — formatação automática no padrão brasileiro `(XX) XXXX-XXXX` (fixo) e `(XX) X XXXX-XXXX` (celular).
- **Botão de agendamento desabilitado** enquanto houver campos inválidos ou vazios.
- **Detecção de conflito de horário** — impede dois atendimentos no mesmo horário e data.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Markup | HTML5 semântico |
| Estilo | CSS3 com variáveis customizadas |
| Lógica | JavaScript (ES Modules) |
| Data/hora | [Day.js](https://day.js.org/) |
| API fake | [json-server](https://github.com/typicode/json-server) |
| Bundler | [Webpack 5](https://webpack.js.org/) |
| Transpiler | Babel (`@babel/preset-env`) |
| Dev server | webpack-dev-server (porta `3000`) |

---

## 📁 Estrutura do Projeto

```
├── index.html               # Template HTML principal
├── main.js                  # Entry point do Webpack; lógica central (localStorage)
├── server.json              # Banco de dados do json-server
├── webpack.config.js        # Configuração do Webpack
├── package.json
└── src/
    ├── assets/              # Ícones SVG (Calendar, Clock, Phone, etc.)
    ├── libs/
    │   └── dayjs.js         # Configuração do Day.js com locale pt-BR
    ├── modules/
    │   ├── page-load.js     # Inicialização da agenda no DOMContentLoaded
    │   ├── form/
    │   │   ├── submit.js    # Validação, máscara de telefone e submit do modal
    │   │   └── date-change.js # Recarrega a agenda ao mudar a data do filtro
    │   └── schedules/
    │       ├── load.js      # Busca agendamentos do dia na API
    │       ├── show.js      # Renderiza os cards nas listas por período
    │       └── cancel.js    # Remove agendamento via API e atualiza a view
    ├── services/
    │   ├── api-config.js         # URL base da API (http://localhost:3333)
    │   ├── schedule-new.js       # POST /schedules
    │   ├── schedule-fetch-by-day.js # GET /schedules + filtro por dia
    │   └── schedule-cancel.js    # DELETE /schedules/:id
    ├── styles/
    │   ├── global.css       # Reset e variáveis CSS
    │   ├── index.css        # Importa todos os arquivos de estilo
    │   ├── style.css        # Componentes (header, modal, cards, botões)
    │   └── utility.css      # Classes utilitárias (.hidden, etc.)
    └── utils/
        └── opening-hours.js # Array com os horários válidos de atendimento
```

---

## ⚙️ Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm

### Instalação

```bash
npm install
```

### Desenvolvimento

Execute os dois comandos em terminais separados:

```bash
# Terminal 1 — API fake (json-server na porta 3333)
npm run server

# Terminal 2 — Dev server com hot reload (porta 3000)
npm run dev
```

Acesse **http://localhost:3000** no navegador.

### Build de Produção

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist/`.

---

## 🔌 API

A API é simulada com `json-server` usando o arquivo `server.json` como banco de dados.

**Base URL:** `http://localhost:3333`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/schedules` | Lista todos os agendamentos |
| `POST` | `/schedules` | Cria um novo agendamento |
| `DELETE` | `/schedules/:id` | Remove um agendamento pelo ID |

### Estrutura de um agendamento

```json
{
  "id": "1777479891126",
  "tutor": "Nome do Tutor",
  "pet": "Nome do Pet",
  "phone": "(19) 9 8600-1908",
  "service": "Banho e tosa",
  "when": "2026-04-30T18:00:00.000Z"
}
```

---

## ✅ Validações do Formulário

| Campo | Regra |
|---|---|
| Nome do tutor | Obrigatório |
| Nome do pet | Obrigatório |
| Telefone | Obrigatório; 10 ou 11 dígitos (fixo ou celular); formatação automática |
| Descrição do serviço | Obrigatório |
| Data | Obrigatório |
| Hora | Obrigatório; deve estar dentro dos horários de funcionamento |

O botão **AGENDAR** permanece desabilitado enquanto houver campos vazios ou com erro.

---

## 🎨 Paleta e Design

A interface utiliza um tema escuro com variáveis CSS centralizadas em `global.css`, garantindo consistência visual em todos os componentes. Os ícones são SVGs inline referenciados via `assets/`.
