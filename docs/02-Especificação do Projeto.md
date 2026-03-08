# Especificações do Projeto

<span style="color:red">Pré-requisitos: <a href="1-Documentação de Contexto.md"> Documentação de Contexto</a></span>

Definição do problema e ideia de solução a partir da perspectiva do usuário. É composta pela definição do  diagrama de personas, histórias de usuários, requisitos funcionais e não funcionais além das restrições do projeto.

Apresente uma visão geral do que será abordado nesta parte do documento, enumerando as técnicas e/ou ferramentas utilizadas para realizar a especificações do projeto

## Personas

### 1. Pedro Paulo
* **Perfil:** 26 anos, arquiteto recém-formado e autônomo. Solteiro, planeja mestrado na Europa.
* **Comportamento:** Extremamente organizado com finanças para viabilizar seu intercâmbio. Usa o carro para visitar obras e clientes.
* **Dor:** Medo de quebras inesperadas que consumam sua reserva financeira para a viagem internacional.
* **Necessidade:** Registro rigoroso de manutenção para valorizar o veículo na revenda futura.
* **No App:** Checklist diário e alertas de manutenção preventiva para evitar gastos corretivos.

### 2. Alberto
* **Perfil:** 45 anos, gerencia 15 vans de entrega rápida.
* **Comportamento:** Toma decisões baseadas em métricas. Não tem tempo para verificar veículo por veículo.
* **Dor:** Falta de responsabilidade dos motoristas e veículos parados por negligência (óleo/pneu).
* **Necessidade:** Centralização de dados e auditoria remota.
* **No App:** Dashboard administrativo e geração de relatórios PDF consolidados.

### 3. Cláudia
* **Perfil:** 34 anos, líder de equipes de campo.
* **Comportamento:** Rigorosa com processos. Gerencia o revezamento de motoristas em turnos.
* **Dor:** Danos estéticos (mossas/riscos) que aparecem sem que nenhum funcionário assuma a culpa.
* **Necessidade:** Prova visual do estado do veículo na entrega das chaves.
* **No App:** Uso obrigatório da funcionalidade de **Upload de Fotos** em 360°.

### 4. Seu Manuel
* **Perfil:** 55 anos, motorista de pesados em rotas interestaduais.
* **Comportamento:** Resistente a tecnologia; usa o celular apenas para o básico (WhatsApp).
* **Dor:** Aplicativos complexos com textos pequenos e que não funcionam sem sinal de internet.
* **Necessidade:** Agilidade para cumprir protocolos de segurança sem atrasar a viagem.
* **No App:** Interface simplificada, botões grandes e **Modo Offline**.

### 5. Ricardo
* **Perfil:** 40 anos, dono de uma rent-a-car local.
* **Comportamento:** Focado em segurança jurídica e proteção do patrimônio.
* **Dor:** Clientes que contestam avarias no momento da devolução do veículo.
* **Necessidade:** Documento datado e assinado com o estado do carro.
* **No App:** Geração automática de PDF de Check-in/Check-out com assinatura digital.

### 6. Jorge
* **Perfil:** 48 anos, responsável pela manutenção preventiva de uma construtora.
* **Comportamento:** Técnico e detalhista. Prefere prevenir do que consertar.
* **Dor:** Receber informações vagas como "o carro está estranho".
* **Necessidade:** Diagnóstico prévio baseado no que o motorista reportou no checklist.
* **No App:** Acesso ao histórico de inspeções para identificar padrões de falha.

### 7. Drª Margarida
* **Perfil:** 52 anos, responsável pela frota de transporte escolar.
* **Comportamento:** Burocrática e focada em conformidade legal (compliance).
* **Dor:** Dificuldade em provar fiscalização em caso de auditorias do governo.
* **Necessidade:** Registro imutável de inspeções de itens de segurança (cintos/freios).
* **No App:** Exportação de logs para prestação de contas governamental.

### 8. Lucas
* **Perfil:** 24 anos, vive e viaja em uma van adaptada (Motorhome).
* **Comportamento:** Conectado e entusiasta da vida ao ar livre.
* **Dor:** Insegurança ao viajar por locais desertos sem saber se a mecânica está 100%.
* **Necessidade:** Checklist customizado para os sistemas da casa (água, bateria, gás).
* **No App:** Funcionalidade de customização total de itens do checklist.

---

## Histórias de Usuários

Com base na análise das personas forma identificadas as seguintes histórias de usuários:

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE` |PARA ... `MOTIVO/VALOR`                 |
|--------------------|------------------------------------|----------------------------------------|
|Usuário do sistema  | Registrar minhas tarefas           | Não esquecer de fazê-las               |
|Administrador       | Alterar permissões                 | Permitir que possam administrar contas |

Apresente aqui as histórias de usuário que são relevantes para o projeto de sua solução. As Histórias de Usuário consistem em uma ferramenta poderosa para a compreensão e elicitação dos requisitos funcionais e não funcionais da sua aplicação. Se possível, agrupe as histórias de usuário por contexto, para facilitar consultas recorrentes à essa parte do documento.

> **Links Úteis**:
> - [Histórias de usuários com exemplos e template](https://www.atlassian.com/br/agile/project-management/user-stories)
> - [Como escrever boas histórias de usuário (User Stories)](https://medium.com/vertice/como-escrever-boas-users-stories-hist%C3%B3rias-de-usu%C3%A1rios-b29c75043fac)
> - [User Stories: requisitos que humanos entendem](https://www.luiztools.com.br/post/user-stories-descricao-de-requisitos-que-humanos-entendem/)
> - [Histórias de Usuários: mais exemplos](https://www.reqview.com/doc/user-stories-example.html)
> - [9 Common User Story Mistakes](https://airfocus.com/blog/user-story-mistakes/)

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.

<strong>Crie no mínimo 12 Requisitos funcionais, 6 não funcionais e 3 restrições</strong>
<strong>Cada aluno será responsável pela execução completa (back, web e mobile) de pelo menos 2 requisitos que será acompanhado pelo professor</strong>
### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade | Responsável |
|------|-----------------------------------------|----|----|
|RF-001| Permitir o cadastro e autenticação de motoristas e gestores | ALTA | Drª Margarida |
|RF-002| Permitir o cadastro detalhado de veículos (placa, modelo, ano) | ALTA | Lucas |
|RF-003| Permitir a criação de modelos de checklist (diário, preventivo) | MÉDIA | Jorge |
|RF-004| Registrar status de itens (Conforme/Não Conforme) | ALTA | Ricardo |
|RF-005| Permitir upload de fotos de avarias nos veículos | ALTA | Manuel |
|RF-006| Permitir a inclusão de observações em texto livre por item | MÉDIA | Cláudia |
|RF-007| Permitir a assinatura digital do condutor ao finalizar | MÉDIA | Alberto |
|RF-008| Calcular automaticamente a conformidade do checklist | ALTA | Pedro Paulo |
|RF-009| Gerar relatórios em PDF das inspeções realizadas | MÉDIA | Drª Margarida |
|RF-010| Enviar notificações de falhas críticas via sistema | ALTA | Lucas |
|RF-011| Permitir a busca de histórico de inspeções por placa | MÉDIA | Jorge |
|RF-012| Permitir a exportação de dados em formato CSV | BAIXA | Ricardo |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| O sistema deve ser responsivo e adaptável a telas mobile | MÉDIA | 
|RNF-002| O sistema deve permitir preenchimento em modo offline | ALTA |
|RNF-003| Tempo de resposta para salvar checklist não deve exceder 2s | MÉDIA |
|RNF-004| Toda a comunicação deve ser protegida via TLS 1.3 | ALTA |
|RNF-005| O sistema deve manter logs de auditoria de cada alteração | MÉDIA |
|RNF-006| A interface deve seguir diretrizes de acessibilidade e contraste | MÉDIA |
|RNF-007| O banco de dados deve suportar crescimento de 10k registros/mês | BAIXA |
|RNF-008| Disponibilidade mínima do sistema de 99,9% | ALTA |
|RNF-009| As imagens enviadas devem ser comprimidas automaticamente | MÉDIA |
|RNF-010| O app deve ser compatível com Android 10+ e iOS 15+ | MÉDIA |

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |

Enumere as restrições à sua solução. Lembre-se de que as restrições geralmente limitam a solução candidata.

> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)

## Diagrama de Casos de Uso

O diagrama de casos de uso é o próximo passo após a elicitação de requisitos, que utiliza um modelo gráfico e uma tabela com as descrições sucintas dos casos de uso e dos atores. Ele contempla a fronteira do sistema e o detalhamento dos requisitos funcionais com a indicação dos atores, casos de uso e seus relacionamentos. 

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Casos de Uso”.

> **Links Úteis**:
> - [Criando Casos de Uso](https://www.ibm.com/docs/pt-br/elm/6.0?topic=requirements-creating-use-cases)
> - [Como Criar Diagrama de Caso de Uso: Tutorial Passo a Passo](https://gitmind.com/pt/fazer-diagrama-de-caso-uso.html/)
> - [Lucidchart](https://www.lucidchart.com/)
> - [Astah](https://astah.net/)
> - [Diagrams](https://app.diagrams.net/)


# Gerenciamento de Projeto

De acordo com o PMBoK v6 as dez áreas que constituem os pilares para gerenciar projetos, e que caracterizam a multidisciplinaridade envolvida, são: Integração, Escopo, Cronograma (Tempo), Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas. Para desenvolver projetos um profissional deve se preocupar em gerenciar todas essas dez áreas. Elas se complementam e se relacionam, de tal forma que não se deve apenas examinar uma área de forma estanque. É preciso considerar, por exemplo, que as áreas de Escopo, Cronograma e Custos estão muito relacionadas. Assim, se eu amplio o escopo de um projeto eu posso afetar seu cronograma e seus custos.

## Gerenciamento de Tempo

Com diagramas bem organizados que permitem gerenciar o tempo nos projetos, o gerente de projetos agenda e coordena tarefas dentro de um projeto para estimar o tempo necessário de conclusão.

![Diagrama de rede simplificado notação francesa (método francês)](img/02-diagrama-rede-simplificado.png)

O gráfico de Gantt ou diagrama de Gantt também é uma ferramenta visual utilizada para controlar e gerenciar o cronograma de atividades de um projeto. Com ele, é possível listar tudo que precisa ser feito para colocar o projeto em prática, dividir em atividades e estimar o tempo necessário para executá-las.

![Gráfico de Gantt](img/02-grafico-gantt.png)

## Gerenciamento de Equipe

O gerenciamento adequado de tarefas contribuirá para que o projeto alcance altos níveis de produtividade. Por isso, é fundamental que ocorra a gestão de tarefas e de pessoas, de modo que os times envolvidos no projeto possam ser facilmente gerenciados. 

![Simple Project Timeline](img/02-project-timeline.png)

