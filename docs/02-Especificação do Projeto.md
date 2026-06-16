# Especificações do Projeto


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

## Requisitos

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
|RF-013| Permitir realizar login | ALTA | TODOS |

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
|01| Tecnológica: O sistema deve ser desenvolvido utilizando uma arquitetura de microserviços |
|02| Infraestrutura: A aplicação deve ser hospedada em ambiente de nuvem com suporte a auto-scaling |
|03| Legal: O sistema deve estar em total conformidade com a Lei Geral de Proteção de Dados (LGPD). |



# Gerenciamento de Projeto

De acordo com o PMBoK v6 as dez áreas que constituem os pilares para gerenciar projetos, e que caracterizam a multidisciplinaridade envolvida, são: Integração, Escopo, Cronograma (Tempo), Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas. Para desenvolver projetos um profissional deve se preocupar em gerenciar todas essas dez áreas. Elas se complementam e se relacionam, de tal forma que não se deve apenas examinar uma área de forma estanque. É preciso considerar, por exemplo, que as áreas de Escopo, Cronograma e Custos estão muito relacionadas. Assim, se eu amplio o escopo de um projeto eu posso afetar seu cronograma e seus custos.


