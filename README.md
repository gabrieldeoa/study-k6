# Tipos de Teste

## Smoke Test

- Valida o funcionamento mínimo da aplicação após uma modificação.
- Testa o caminho feliz com carga mínima.
- A carga mínima é aplicada por um curto período.

## Performance/Load Test

- Avalia o desempenho da aplicação.
- Mede o comportamento sob condições normais e de pico.
- O objetivo é garantir que a aplicação funcione bem com determinados parâmetros.
- Utiliza carga constante e carga variável (através de estágios):
  - **Fase 1 - Arrancada (Run-Up):** usuários chegando gradualmente.
  - **Fase 2 - Pico:** acessos simultâneos constantes.
  - **Fase 3 - Desaceleração (Run-Down):** redução gradual dos usuários até zerar.

## Stress Test

- Avalia o comportamento da aplicação sob alta carga.
- Mede a resposta do sistema em condições extremas.
- Identifica a capacidade máxima de usuários e taxa de transferência.
- Determina o ponto de ruptura do sistema.
- Verifica se o sistema se recupera automaticamente após o teste.
- Ajuda a identificar gargalos na arquitetura da aplicação.
- Utiliza múltiplos ciclos de arrancada, pico e desaceleração.
- Valida o escalonamento programado da aplicação.

### Spike Test

- Em vez de aumentar gradualmente a carga, um pico abrupto de acessos é gerado em um curto período.
- Avalia o comportamento diante de um aumento repentino de tráfego.
- Classificação de resultados:
  1. **Excelente:** comportamento similar ao uso normal do sistema.
  2. **Bom:** resposta mais lenta, mas sem erros.
  3. **Insatisfatório:** erros sob carga alta, mas recuperação após redução.
  4. **Ruim:** sistema trava e não se recupera mesmo após a diminuição da carga.

## Soak Test

- Avalia a confiabilidade do sistema por longos períodos de tempo.
- Identifica possíveis vazamentos de memória.
- Garante que reinicializações não resultem em perda de dados.
- Testa concorrência e estabilidade do banco de dados.
- Verifica se logs não consomem todo o espaço em disco.
- Confirma se serviços externos suportam requisições contínuas.
- **Importante:** a carga de usuários deve estar em torno de 80% da capacidade máxima, evitando alcançar o ponto de ruptura.

## Breakpoint Test

- Avalia os limites do sistema.
- Identifica pontos críticos da infraestrutura.
- Útil após grandes mudanças na aplicação para verificar melhorias no ponto de ruptura.
- Mede se o sistema suporta cargas maiores ao longo do tempo.
- Deve ser executado após os demais testes.
- Indicado para sistemas maduros com boa cobertura de testes.
- **Atenção:** O objetivo é testar os limites do sistema, não a elasticidade da infraestrutura.

# Ciclo de Vida de um Teste no k6

### 1. Inicialização

```js
import sleep from "k6";
```

### 2. Configuração (Setup)

```js
export const options = {
  vus: 1,
  duration: "10s",
};
```

### 3. Execução

```js
export default function () {
  console.log("Testando k6");
  sleep(1);
}
```

### 4. Desmontagem (Opcional)

```js
export function teardown(data) {
  console.log(data);
}
```

# Tipos de Métricas

1. **Contadores:** somas e incrementos.
2. **Medidores:** maior, menor e mais recente valor.
3. **Taxas:** frequência de ocorrência de valores diferentes de zero.
4. **Tendência:** média, moda, mediana e percentis de intervalos.

# Thresholds

- Definem métricas que, caso não sejam atingidas, serão tratadas como falha.

# Módulos no k6

1. **Embutidos:** já vêm com a biblioteca.
2. **Remotos:** importados do repositório [https://jslib.k6.io/](https://jslib.k6.io/).
3. **Sistema local de arquivos:** permite carregar arquivos locais.

Também é possível desenvolver módulos personalizados com **xk6**.

# Groups

- Permitem agrupar requisições.
- O CLI exibe os checks organizados por grupo.
- Relatórios gerados incluem os grupos.
- Thresholds podem ser aplicados a grupos específicos:

```js
threshoulds: {
  "http_req_duration{group::NAME}": ["p(95) < 500"]
}
```

# Tags

- Utilizadas para rotular requests, checks, thresholds e métricas.
- Permitem combinar **group + tag**:

```js
tags: {
  "tag_name": "valor"
}
```

- Thresholds podem ser aplicados a tags específicas:

```js
threshoulds: {
  "http_req_duration{tag_name:tag_value}": ["p(95) < 500"]
}
```

# Variáveis de Ambiente

- Captura dentro do script:

```js
export default function () {
  const BASE_URL = __ENV.URL;
  const res = http.get(BASE_URL);
}
```

- Passagem via linha de comando:

```shell
k6 run -e URL=https://test-api.k6.io/crocodiles/ arquivo.js
```

- Também é possível passar opções do k6 via comando:

```shell
k6 run -e URL=https://test-api.k6.io/crocodiles/ arquivo.js --duration 5s --vus 10 --stage 5s:5,5s:5,5s:0
```

# Cenários no k6

## Vantagens:

1. Melhor organização dos testes.
2. Simulações mais realistas.
3. Cargas de trabalho sequenciais ou paralelas.
4. Análise granular dos resultados.

## Opções dos Cenários

- **executor:** define o tipo de execução do teste.
- **startTime:** determina quando o cenário deve iniciar.
- **gracefulStop:** tempo extra para finalização das iterações.
- **exec:** função que executa o teste.
- **env:** define variáveis de ambiente.
- **tags:** adiciona identificadores personalizados.

## Tipos de Executores

### Baseados em Iterações

1. **shared-iterations:** iterações compartilhadas entre os VUs.
2. **per-vu-iterations:** cada VU executa um número fixo de iterações.

### Baseados em Número de VUs

1. **constant-vus:** número fixo de VUs durante a execução.
2. **ramping-vus:** número de VUs aumenta gradualmente.

### Baseados em Taxa de Iteração

1. **constant-arrival-rate:** mantém uma taxa fixa de requisições por segundo.

```js
export const options = {
  scenarios: {
    contacts: {
      executor: "constant-arrival-rate",
      duration: "30s",
      rate: 30, // requisições por segundo
      timeUnit: "1s", // intervalo entre requisições
      preAllocatedVUs: 50, // VUs pré-alocados
    },
  },
};
```

2. **ramping-arrival-rate:** aumenta a taxa de iterações de forma progressiva.

# Sleep

Tempo de espera de uma VU para pegar uma iteração.

# Relatórios

Uma forma de gerar relatório é usar o pacote externo [k6-reporter](https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js).

Basta importar e utilizá-lo dentro da função **handleSummary**, essa função captura a saída do cli para o formato configurado.

```js
export function handleSummary(data) {
  return {
    "example_report.html": htmlReport(data),
  };
}
```

Assim a saída padrão na CLI não irá acontecer mas será armazenada no arquivo.

# Dashboard

O plugin agora faz parte do core, então basta rodar o comando com a flag **K6_WEB_DASHBOARD=true** que teremos o dashboard em tempo real.

```cli
K6_WEB_DASHBOARD=true k6 run example_dashboard.js
```

Para gerar o relatório do dashboard via CLI basta adicionar a flag **K6_WEB_DASHBOARD_EXPORT:<<report_name>>.html** passando o nome do mesmo.

```cli
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT= k6 run example_dashboard.js
```

# Grafana Cloud k6

1. Escalabilidade.
2. Flexibilidade geográfica.
3. Confiança nos resultados.

Crie uma conta, tem a opção gratuita, pegue o **token** no painel faça login via clio e adicione o **projectID** o objeto abaixo na options:

```cli
k6 login cloud --token <<token_aqui>>

```

No options:

```js
ext: {
    loadimpact: {
      projectID: "<ID_AQUI>",
      name: "POC CURSO K6",
    },
  }
```

Para rodar o script na cloud

```cli
k6 cloud <<script>>
```

Também temos a possibilidade de rodar localmente e visualizar os resultados via cloud:

```cli
k6 run --out cloud <<script>>
```

# Testes em frontend

- Navegador: Mede o desempenho do frontend simulando usuários reais acessando a aplicação através do navegador.
- Protocolo: Mede o desempenho do backend simulando as solicitações subjacentes às ações do usuário.
- Híbrido: Combinação dos dois anteriores.

Hoje conseguimos testar também o frontend pelo k6, na versão 0.43.0 ou superior.
